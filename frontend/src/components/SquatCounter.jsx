


import React, { useRef, useEffect, useState } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import './SquatCounter.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const BUFFER_SIZE = 5;
const REQUIRED_COUNT = 3;
const HIP_ABOVE_ANKLE_MIN_DIFF = 90; // Adjust as needed for your scene/camera

const SquatCounter = () => {
    const API = import.meta.env.VITE_API
    const navigate = useNavigate()
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const poseLandmarkerRef = useRef(null);
    const animationFrameRef = useRef(null);

    const [count, setCount] = useState(0);
    const [stage, setStage] = useState('Waiting...');
    const [currentKneeAngle, setCurrentKneeAngle] = useState(0);
    const [currentHipDiff, setCurrentHipDiff] = useState(0);
    const [ready, setReady] = useState(false);

    const isDownRef = useRef(false);
    const lastStageChangeTime = useRef(0);
    const debounceTime = 700;

    // Buffers for angle smoothing
    const kneeDownBuffer = useRef([]);
    const kneeUpBuffer = useRef([]);

    // Helper: checks if landmark is valid and on screen
    const isLandmarkValid = (pt) =>
        pt && pt.x > 0.01 && pt.y > 0.01 && pt.x < 0.99 && pt.y < 0.99;

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
    }, [ready]);

    const calculateAngle = (a, b, c) => {
        const radians =
            Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs((radians * 180.0) / Math.PI);
        if (angle > 180.0) angle = 360 - angle;
        return angle;
    };

    const detect = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!poseLandmarkerRef.current || video.readyState !== 4) {
            animationFrameRef.current = requestAnimationFrame(detect);
            return;
        }
        try {
            const results = await poseLandmarkerRef.current.detectForVideo(video, performance.now());
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            if (results.landmarks?.length) {
                const lm = results.landmarks[0];
                const du = new DrawingUtils(ctx);
                du.drawConnectors(lm, PoseLandmarker.POSE_CONNECTIONS, { color: '#0F0', lineWidth: 2 });
                du.drawLandmarks(lm, { radius: 4, color: '#F00', fillColor: '#0F0' });

                // Leg landmarks
                const leftHip = lm[23], rightHip = lm[24];
                const leftKnee = lm[25], rightKnee = lm[26];
                const leftAnkle = lm[27], rightAnkle = lm[28];

                // Validity checks
                const leftLegVisible = isLandmarkValid(leftHip) && isLandmarkValid(leftKnee) && isLandmarkValid(leftAnkle);
                const rightLegVisible = isLandmarkValid(rightHip) && isLandmarkValid(rightKnee) && isLandmarkValid(rightAnkle);
                const legsVisible = leftLegVisible && rightLegVisible;

                if (!legsVisible) {
                    setStage('Legs Not Visible');
                    animationFrameRef.current = requestAnimationFrame(detect);
                    return;
                }

                // Angles
                const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
                const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
                const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
                setCurrentKneeAngle(Math.round(avgKneeAngle));

                // Hip/Ankle vertical separation (anti-fraud)
                const canvasH = canvas.height;
                const leftHipY = leftHip.y * canvasH, rightHipY = rightHip.y * canvasH;
                const leftAnkleY = leftAnkle.y * canvasH, rightAnkleY = rightAnkle.y * canvasH;
                const avgHipY = (leftHipY + rightHipY) / 2;
                const avgAnkleY = (leftAnkleY + rightAnkleY) / 2;
                const hipAboveAnkle = avgAnkleY - avgHipY;
                setCurrentHipDiff(Math.round(hipAboveAnkle));

                // Buffer squat logic
                // DOWN: knee angle < 110
                kneeDownBuffer.current.push(avgKneeAngle < 110 ? 1 : 0);
                if (kneeDownBuffer.current.length > BUFFER_SIZE) kneeDownBuffer.current.shift();

                // UP: knee angle > 160 and actually standing tall
                kneeUpBuffer.current.push(avgKneeAngle > 160 && hipAboveAnkle > HIP_ABOVE_ANKLE_MIN_DIFF ? 1 : 0);
                if (kneeUpBuffer.current.length > BUFFER_SIZE) kneeUpBuffer.current.shift();

                const isDownBuffered =
                    kneeDownBuffer.current.reduce((a, b) => a + b, 0) >= REQUIRED_COUNT;
                const isUpBuffered =
                    kneeUpBuffer.current.reduce((a, b) => a + b, 0) >= REQUIRED_COUNT;

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
            }
        } catch (err) {
            console.error('Detect error:', err);
        }
        animationFrameRef.current = requestAnimationFrame(detect);
    };

    const reset = () => {
        setCount(0);
        setStage('Waiting...');
        setCurrentHipDiff(0);
        isDownRef.current = false;
        lastStageChangeTime.current = 0;
        kneeDownBuffer.current = [];
        kneeUpBuffer.current = [];
    };
    const handleStop = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await axios.put(`${API}/student/updatesquats`, { count }, { headers: { Authorization: ` bearer ${token}` } })
            alert(res.data.message)
            console.log('squats updated')
            navigate('/dashboard')

        } catch (err) {
            alert(res.data.message)
            console.log(err)
        }


    }

    return (
        <div style={{ textAlign: 'center', padding: 20 }}>
            <h2 className='heading2'>Squat Counter</h2>
            <br />
            <div style={{ display: 'inline-block', position: 'relative' }}>
                <video ref={videoRef} style={{ display: 'none' }} playsInline />
                <canvas
                    ref={canvasRef}
                    style={{ border: '2px solid #333', borderRadius: 8, maxWidth: '100%' }}
                />
            </div>
            <div style={{ margin: '15px 0' }}>
                {/* <h3>Knee Angle: {currentKneeAngle}°</h3>
        <h3>Hip-Ankle Y Difference: {currentHipDiff}px</h3> */}
                <h3 className='heading3'>Stage: {stage}</h3>
                <h3 className='heading3'>Count: {count}</h3>
            </div>
            <div className='squatdiv'>
                <button onClick={reset} >
                    Reset
                </button>
                <button onClick={handleStop}> Stop & Save</button>
            </div>
            {!ready && <p>Loading detector...</p>}
            <div style={{ textAlign: 'left', maxWidth: 460, margin: '20px auto', color: '#555' }} className='instructions'>
                <h4 className='heading4'>Instructions:</h4>
                <ul>
                    <li>Stand upright and fully visible</li>
                    <li>Only rising to full standing (hips above ankles) counts a rep.</li>
                    <li>Sitting or cheat-moves (hips near ankles) won’t be counted!</li>

                </ul>
            </div>
        </div>
    );
};

export default SquatCounter;
