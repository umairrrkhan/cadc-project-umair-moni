import React , {useState , useRef} from 'react';
import '../css/VisionMode.css';

const VisionMode = () => {
    const [uploadedImage, setUploadedImage] = useState(null);
    const [generateImage , setGenerateImage] = useState(null);
    const[answer , setAnswer] = useState('');
    const fileRef = useRef();

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target.result);
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
            };
            reader.readAsDataURL(file);
        }
    };
    return (
        <div className = "vision-mode">
            <div className = "vision-panels">
                <div className = "upload-panel" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileRef.current.click()}> 
                    {uploadedImage ? (
                        <img src={uploadedImage} alt="Uploaded" className="panel-imag" />

                    ) : ( <div className="panel-placeholder">
                        <p>Drag & drop an image here</p>
                    </div>
                )}
                <input
                ref = {fileRef}
                type="file"
                accept="image/*"
                style= {{display:'none' }}
                onChange={handleImageUpload}
                />
            </div>
            <div className = "panel generate-panel">
                {generateImage ? (
                    <img src={generateImage} alt="Generated" className="panel-image" /> 
                ) : (
                    <div className="panel-placeholder">
                        <p>Generated image will appear here</p>
                    </div>
                )}
            </div>
        </div>

        {/* analyze button */}
        <button className="analyze-btn" onClick={() => setAnswer('This is a simulated answer based on the uploaded image.')}>Analyze Image</button>
        <div className="answer-section">
            <p>{answer}</p>
        </div>

        ){'}'}
        </div>
    );
};

export default VisionMode;