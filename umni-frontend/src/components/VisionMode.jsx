import React , {useState , useRef , useEffect} from 'react';
import '../css/VisionMode.css';

const VisionMode = () => {
    const [uploadedImage, setUploadedImage] = useState(null);
    const [generateImage , setGenerateImage] = useState(null);
    const[answer , setAnswer] = useState('');
    const [mode , setMode] = useState('upload');

    const fileRef = useRef(null);
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        if(mode === 'canvas' && canvasRef.current){
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width - 10; 
            canvas.height = rect.height - 10;

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.lineWidth = 3;
            ctx.strokeStyle = '#000000';
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
        }
    }, [mode]);

    const startDrawing = (e) => {
        if (mode !== 'canvas') return;
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e) => {
        if (!isDrawing || mode !== 'canvas') return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target.result);
                setMode('upload');
            };
            reader.readAsDataURL(file);
        }
    };
    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target.result);
                setMode('upload');
            };
            reader.readAsDataURL(file);
        }
    };
    return (
        <div className="vision-wrapper">
            <div className="vision-panels">
                {/* Left Panel: Upload / Canvas Input */}
                <div 
                    className="panel input-panel" 
                    onDrop={handleDrop} 
                    onDragOver={(e) => e.preventDefault()}
                >
                    <div className="panel-toolbar">
                        <button 
                            className={`tool-btn ${mode === 'canvas' ? 'active' : ''}`}
                            onClick={() => setMode('canvas')}
                        >
                            Canvas
                        </button>
                        <button 
                            className="tool-btn"
                            onClick={() => fileRef.current.click()}
                        >
                            Upload
                        </button>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageUpload}
                        />
                    </div>

                    <div className="panel-content">
                        {mode === 'canvas' ? (
                            <canvas
                                ref={canvasRef}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                            />
                        ) : uploadedImage ? (
                            <img src={uploadedImage} alt="Uploaded" className="panel-image" />
                        ) : (
                            <div className="panel-placeholder">
                                <p>Drag & drop an image here</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="panel output-panel">
                    {generateImage ? (
                        <img src={generateImage} alt="Generated" className="panel-image" />
                    ) : (
                        <div className="panel-placeholder">
                            <p>Generated image will appear here</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="answer-container">
                <input
                    type="text"
                    className="answer-input"
                    placeholder="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                />
            </div>

        {/* analyze button */}
        <button className="analyze-btn" onClick={() => setAnswer('This is a simulated answer based on the uploaded image.')}>Analyze Image</button>){'}'}
        </div>
    );
};

export default VisionMode;