import io
import re
from fastapi import HTTPException, status
from pypdf import PdfReader
from pypdf.errors import PdfReadError, PdfStreamError


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract and sanitize text from an uploaded PDF file.
    
    Raises:
        HTTPException (400) if the PDF is corrupted, encrypted, empty,
        or contains insufficient legible text (e.g. image-only scans).
    """
    if not file_bytes or len(file_bytes) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty or too small to be a valid PDF."
        )

    try:
        pdf_stream = io.BytesIO(file_bytes)
        reader = PdfReader(pdf_stream)

        if reader.is_encrypted:
            try:
                reader.decrypt("")
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The PDF file is password protected or encrypted."
                )

        extracted_pages: list[str] = []
        for index, page in enumerate(reader.pages):
            try:
                page_text = page.extract_text() or ""
                if page_text.strip():
                    extracted_pages.append(page_text.strip())
            except Exception as page_err:
                # Log or skip damaged page while preserving other pages
                continue

        raw_combined = "\n\n".join(extracted_pages)
        # Normalize whitespace (replace multiple spaces/tabs with single space)
        cleaned_text = re.sub(r"[ \t]+", " ", raw_combined)
        # Normalize excessive newlines
        cleaned_text = re.sub(r"\n{3,}", "\n\n", cleaned_text).strip()

        if len(cleaned_text) < 30:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Unable to extract sufficient legible text from the PDF (less than 30 characters). "
                    "Please ensure the document contains selectable text and is not an image-only scan."
                )
            )

        return cleaned_text

    except (PdfReadError, PdfStreamError, ValueError) as parse_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid or corrupted PDF file structure: {str(parse_err)}"
        )
    except HTTPException:
        raise
    except Exception as unexpected_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process PDF document: {str(unexpected_err)}"
        )
