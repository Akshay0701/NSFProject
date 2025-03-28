import logging
import PyPDF2
from werkzeug.datastructures import FileStorage
from src.exceptions.custom_exceptions import ProcessingError

logger = logging.getLogger(__name__)

def extract_text_from_pdf(pdf_file: FileStorage) -> str:
    """
    Extract text from a PDF file object.

    Args:
        pdf_file (FileStorage): The PDF file to extract text from.

    Returns:
        str: Extracted text from the PDF.

    Raises:
        ProcessingError: If text extraction fails.
    """
    try:
        logger.info("Extracting text from PDF file")
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            page_text = page.extract_text() or ""
            text += page_text
        logger.debug(f"Extracted text: {text[:100]}...")  # Log first 100 chars for debugging
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        raise ProcessingError(f"Failed to extract text from PDF: {str(e)}")