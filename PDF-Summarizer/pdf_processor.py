# pdf_processor.py
import PyPDF2
from transformers import pipeline
import os

# Force CPU usage
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

class PDFSummarizer:
    def __init__(self, model_name="t5-small"):
        """Initialize with a smaller model for faster loading and less memory usage"""
        print("Loading summarization model (this might take a moment)...")
        self.summarizer = pipeline("summarization", model=model_name, device=-1)  # Force CPU
        print("Model loaded successfully!")
    
    def extract_text_from_pdf(self, pdf_file):
        """Extract text from a PDF file"""
        text = ""
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:  # Only add non-empty pages
                    text += page_text + "\n"
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
        
        if not text.strip():
            raise Exception("No text could be extracted from the PDF file")
            
        return text
    
    def summarize_text(self, text, max_length=150, min_length=50):
        """Summarize the given text"""
        # Handle very short texts
        if len(text.split()) < 50:
            return "Text too short for summarization: " + text
            
        # Handle text length limitations by chunking if necessary
        if len(text.split()) > 500:  # T5-small can handle about 512 tokens
            chunks = self._chunk_text(text)
            summaries = []
            for i, chunk in enumerate(chunks):
                print(f"Summarizing chunk {i+1} of {len(chunks)}...")
                summary = self.summarizer(chunk, max_length=max_length//len(chunks), 
                                         min_length=min_length//len(chunks))
                summaries.append(summary[0]['summary_text'])
            return " ".join(summaries)
        else:
            return self.summarizer(text, max_length=max_length, min_length=min_length)[0]['summary_text']
    
    def _chunk_text(self, text, max_words=400):
        """Split text into chunks of max_words"""
        words = text.split()
        chunks = []
        for i in range(0, len(words), max_words):
            chunks.append(" ".join(words[i:i+max_words]))
        return chunks
    
    def process_pdf(self, pdf_file, max_length=150, min_length=50):
        """Process a PDF file and return its summary"""
        text = self.extract_text_from_pdf(pdf_file)
        print(f"Extracted {len(text.split())} words from PDF. Summarizing...")
        summary = self.summarize_text(text, max_length, min_length)
        return {"original_text": text, "summary": summary}