import React, { useRef, useEffect, useState } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import axios from 'axios';
import './PushUpCounter.css'
import { useNavigate } from 'react-router-dom';

const BUFFER_SIZE = 5;
const REQUIRED_COUNT = 3;

const PushUpCounter = () => {
    const navigate = useNavigate()
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const poseLandmarkerRef = useRef(null);
    const animationFrameRef = useRef(null);

    const [count, setCount] = useState(0);
    const [stage, setStage] = useState('Waiting...');
    const [currentAngle, setCurrentAngle] = useState(0);
    const [currentKneeAngle, setCurrentKneeAngle] = useState(0);
    const [ready, setReady] = useState(false);

    const isDownRef = useRef(false);
    const lastStageChangeTime = useRef(0);
    const debounceTime = 700;

    // Buffers
    const elbowDownBuffer = useRef([]);
    const elbowUpBuffer = useRef([]);
    const kneeStraightBuffer = useRef([]);

    // Helper function: checks if landmark looks valid
    const isLandmarkValid = (pt) =>
        pt && pt.x > 0.01 && pt.y > 0.01 && pt.x < 0.99 && pt.y < 0.99;

    // Initialization and cleanup
    useEffect(() => {
        const init = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
                );
                poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath:
                            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numPoses: 1,
                });
                setReady(true);
            } catch (err) {
                console.error('Init error:', err);
            }
        };
        init();
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (videoRef.current?.srcObject)
                videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        };
    }, []);

    useEffect(() => {
        if (!ready) return;
        (async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play();
                    const canvas = canvasRef.current;
                    canvas.width = videoRef.current.videoWidth;
                    canvas.height = videoRef.current.videoHeight;
                    detect();
                };
            } catch (err) {
                alert("Can't open camera: " + err.message);
            }
        })();
        // eslint-disable-next-line
    }, [ready]);

    // Angle helper
    const calculateAngle = (a, b, c) => {
        const radians =
            Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs((radians * 180.0) / Math.PI);
        if (angle > 180.0) angle = 360 - angle;
        return angle;
    };

    // Detection and logic
    const detect = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!poseLandmarkerRef.current || video.readyState !== 4) {
            animationFrameRef.current = requestAnimationFrame(detect);
            return;
        }

        try {
            const results = await poseLandmarkerRef.current.detectForVideo(
                video,
                performance.now()
            );
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            if (results.landmarks?.length) {
                const lm = results.landmarks[0];

                const du = new DrawingUtils(ctx);
                du.drawConnectors(lm, PoseLandmarker.POSE_CONNECTIONS, {
                    color: '#0F0',
                    lineWidth: 2,
                });
                du.drawLandmarks(lm, {
                    radius: 4,
                    color: '#F00',
                    fillColor: '#0F0',
                });

                // Arms and legs
                const leftShoulder = lm[11], rightShoulder = lm[12];
                const leftElbow = lm[13], rightElbow = lm[14];
                const leftWrist = lm[15], rightWrist = lm[16];
                const leftHip = lm[23], rightHip = lm[24];
                const leftKnee = lm[25], rightKnee = lm[26];
                const leftAnkle = lm[27], rightAnkle = lm[28];

                const leftLegVisible =
                    isLandmarkValid(leftHip) && isLandmarkValid(leftKnee) && isLandmarkValid(leftAnkle);
                const rightLegVisible =
                    isLandmarkValid(rightHip) && isLandmarkValid(rightKnee) && isLandmarkValid(rightAnkle);
                const legsVisible = leftLegVisible && rightLegVisible;

                if (!legsVisible) {
                    setStage('Legs Not Visible');
                    animationFrameRef.current = requestAnimationFrame(detect);
                    return;
                }

                // Angles
                const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
                const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
                const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;
                setCurrentAngle(Math.round(avgElbowAngle));

                const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
                const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
                const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
                setCurrentKneeAngle(Math.round(avgKneeAngle));

                // Buffer logic
                elbowDownBuffer.current.push(avgElbowAngle < 100 ? 1 : 0);
                if (elbowDownBuffer.current.length > BUFFER_SIZE) elbowDownBuffer.current.shift();

                elbowUpBuffer.current.push(avgElbowAngle > 165 ? 1 : 0);
                if (elbowUpBuffer.current.length > BUFFER_SIZE) elbowUpBuffer.current.shift();

                kneeStraightBuffer.current.push(leftKneeAngle > 150 && rightKneeAngle > 150 ? 1 : 0);
                if (kneeStraightBuffer.current.length > BUFFER_SIZE) kneeStraightBuffer.current.shift();

                const isDownBuffered =
                    elbowDownBuffer.current.reduce((a, b) => a + b, 0) >= REQUIRED_COUNT &&
                    kneeStraightBuffer.current.reduce((a, b) => a + b, 0) >= REQUIRED_COUNT;

                const isUpBuffered =
                    elbowUpBuffer.current.reduce((a, b) => a + b, 0) >= REQUIRED_COUNT &&
                    kneeStraightBuffer.current.reduce((a, b) => a + b, 0) >= REQUIRED_COUNT;

                const now = Date.now();
                if (isDownBuffered && !isDownRef.current) {
                    isDownRef.current = true;
                    setStage('DOWN');
                    lastStageChangeTime.current = now;
                }
                if (
                    isUpBuffered &&
                    isDownRef.current &&
                    now - lastStageChangeTime.current > debounceTime
                ) {
                    setCount((c) => c + 1);
                    isDownRef.current = false;
                    setStage('UP');
                    lastStageChangeTime.current = now;
                }
                if (
                    kneeStraightBuffer.current.reduce((a, b) => a + b, 0) < REQUIRED_COUNT &&
                    legsVisible
                ) {
                    setStage('Legs Bent');
                }
            }
        } catch (err) {
            console.error('Detect error:', err);
        }

        animationFrameRef.current = requestAnimationFrame(detect);
    };

    const reset = () => {
        setCount(0);
        setStage('Waiting...');
        isDownRef.current = false;
        lastStageChangeTime.current = 0;
        elbowDownBuffer.current = [];
        elbowUpBuffer.current = [];
        kneeStraightBuffer.current = [];
    };
    const handleStop = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await axios.put('http://localhost:3000/student/updatePushups',
                { count },
                { headers: { Authorization: `Bearer ${token}` } })
            console.log('pushups updated')
            alert(res.data.message)
            navigate('/dashboard')

        } catch (err) {
            // alert(res.data.message)
            console.log(err)
        }
    }

    return (
        <div style={{ textAlign: 'center', padding: 20 }}>
            <h2 className='heading2'>Push-Up Counter </h2>
            <br />
            <div style={{ display: 'inline-block', position: 'relative' }}>
                <video ref={videoRef} style={{ display: 'none' }} playsInline />
                <canvas
                    ref={canvasRef}
                    style={{ border: '2px solid #333', borderRadius: 8, maxWidth: '100%' }}
                />
            </div>
            <div style={{ margin: '15px 0' }}>
                {/* <h3>Elbow Angle: {currentAngle}°</h3>
                <h3>Knee Angle: {currentKneeAngle}°</h3> */}
                <h3 className='heading3'>Stage: {stage}</h3>
                <h3 className='heading3'>Count: {count}</h3>
            </div>
            <div className='pushupbut'>
                <button onClick={reset} >
                    Reset
                </button>

                <button onClick={handleStop} >Stop & Save</button>
            </div>
            {!ready && <p>Loading detector...</p>}
            <div style={{ textAlign: 'left', maxWidth: 400, margin: '20px auto', color: '#555' }} className='instructions'>
                <h4 className='heading4'>Instructions:</h4>
                <ul>
                    <li>Full body must be visible, especially knees and ankles.</li>
                    <li>Do plank push-ups with legs straight for reps to count.</li>
                    <li>It wont accept fast reps. it counts rep by rep ..Be patient while counting</li>
                   
                </ul>
            </div>
        </div>
    );
};

export default PushUpCounter;
