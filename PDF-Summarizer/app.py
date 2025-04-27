# app.py
from flask import Flask, render_template, request, jsonify
import os
from pdf_processor import PDFSummarizer

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize summarizer when needed, not at startup
summarizer = None

def get_summarizer():
    global summarizer
    if summarizer is None:
        # Lazy loading to avoid startup errors
        print("Initializing summarizer...")
        summarizer = PDFSummarizer()
    return summarizer

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/summarize', methods=['POST'])
def summarize_pdf():
    if 'pdf_file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['pdf_file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and file.filename.endswith('.pdf'):
        # Save the file temporarily
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)
        
        max_length = int(request.form.get('max_length', 150))
        min_length = int(request.form.get('min_length', 50))
        
        try:
            # Get summarizer instance
            summarizer = get_summarizer()
            with open(file_path, 'rb') as f:
                result = summarizer.process_pdf(f, max_length, min_length)
            
            # Clean up the file after processing
            os.remove(file_path)
            return jsonify(result)
        except Exception as e:
            # Clean up on error too
            if os.path.exists(file_path):
                os.remove(file_path)
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'File must be a PDF'}), 400

if __name__ == '__main__':
    app.run(debug=True)