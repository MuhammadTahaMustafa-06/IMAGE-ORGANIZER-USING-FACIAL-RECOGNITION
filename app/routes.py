import io
import os
from zipfile import ZipFile
from flask import render_template, request, send_file
from app import app
from app.image_processing_utils import find_matching_images

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process_image', methods=['POST'])
def process_image():
    target_image = request.form['image']
    matching_images = find_matching_images(target_image)
    zip_buffer = io.BytesIO()
    
    with ZipFile(zip_buffer, 'w') as zip_file:
        for image_path in matching_images:
            with open(image_path, 'rb') as file:
                image_content = file.read()
                zip_file.writestr(os.path.basename(image_path), image_content)
    
    zip_buffer.seek(0)

    return send_file(
    zip_buffer,
    as_attachment=True,
    download_name='extracted_images.zip',
    mimetype='application/zip'
)

