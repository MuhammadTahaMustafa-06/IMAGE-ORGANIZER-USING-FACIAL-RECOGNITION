import logging
import base64
import re
import os
import io
import face_recognition

def is_base64(s):
    # Check if the string is a valid base64 format
    return bool(re.match(r'^data:image\/[a-zA-Z+]+;base64,', s))

def find_matching_images(target_image):
    if not is_base64(target_image):
        logging.error("Invalid base64 image format.")
        return []

    try:
        decoded_image = base64.b64decode(target_image.split(",")[1])
        img = face_recognition.load_image_file(io.BytesIO(decoded_image))
        target_encodings = face_recognition.face_encodings(img)
        
        if not target_encodings:
            logging.warning("No faces found in the target image.")
            return []

        image_directory ="C:/Users/user/Pictures/pics"
        matching_images = []

        for root, _, files in os.walk(image_directory):
            for file in files:
                image_path = os.path.join(root, file)
                image = face_recognition.load_image_file(image_path)
                encodings = face_recognition.face_encodings(image)

                if encodings:
                    match = face_recognition.compare_faces(target_encodings, encodings[0])
                    if match[0]:
                        matching_images.append(image_path)
    except FileNotFoundError as fnf_error:
        logging.error(f"File not found error: {str(fnf_error)}")
        return []
    except Exception as e:
        logging.error(f"Error occurred: {str(e)}")
        return []

    return matching_images
