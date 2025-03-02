const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('pdfFile');
const fileNameDisplay = document.getElementById('fileName');
const downloadButton = document.getElementById('downloadButton');
const downloadButtonContainer = document.getElementById('downloadButtonContainer');

dropArea.addEventListener('click', () => {
    fileInput.click();
});

dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('active');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('active');
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('active');
    fileInput.files = e.dataTransfer.files;
    if (fileInput.files.length > 0) {
        fileNameDisplay.textContent = '選択されたファイル: ' + fileInput.files[0].name;
    } else {
        fileNameDisplay.textContent = '';
    }
});

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        fileNameDisplay.textContent = '選択されたファイル: ' + fileInput.files[0].name;
    } else {
        fileNameDisplay.textContent = '';
    }
});

document.getElementById('convertButton').addEventListener('click', function() {
    const file = document.getElementById('pdfFile').files[0];
    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        fetch('http://127.0.0.1:8000/pdf_to_image/', {
            method: 'POST',
            body: formData
        })
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            downloadButton.href = url;
            downloadButtonContainer.style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else {
        alert('Please select a PDF file.');
    }
});

downloadButton.addEventListener('click', function(event) {
    event.stopPropagation(); // イベント伝播を停止
    const url = downloadButton.href;
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted_image.jpg';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);

    // ダウンロード完了後の処理
    fileInput.value = '';
    fileNameDisplay.textContent = '';
    downloadButtonContainer.style.display = 'none';
});


// PDF圧縮用のJavaScriptコード
const compressDropArea = document.getElementById('compressDropArea');
const compressPdfFile = document.getElementById('compressPdfFile');
const compressFileNameDisplay = document.getElementById('compressFileName');
const compressDownloadButton = document.getElementById('compressDownloadButton');
const compressDownloadButtonContainer = document.getElementById('compressDownloadButtonContainer');

compressDropArea.addEventListener('click', () => {
    compressPdfFile.click();
});

compressDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    compressDropArea.classList.add('active');
});

compressDropArea.addEventListener('dragleave', () => {
    compressDropArea.classList.remove('active');
});

compressDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    compressDropArea.classList.remove('active');
    compressPdfFile.files = e.dataTransfer.files;
    if (compressPdfFile.files.length > 0) {
        compressFileNameDisplay.textContent = '選択されたファイル: ' + compressPdfFile.files[0].name;
    } else {
        compressFileNameDisplay.textContent = '';
    }
});

compressPdfFile.addEventListener('change', () => {
    if (compressPdfFile.files.length > 0) {
        compressFileNameDisplay.textContent = '選択されたファイル: ' + compressPdfFile.files[0].name;
    } else {
        compressFileNameDisplay.textContent = '';
    }
});

document.getElementById('compressButton').addEventListener('click', function() {
    const file = document.getElementById('compressPdfFile').files[0];
    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        fetch('http://127.0.0.1:8000/compress_pdf/', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            const blob = base64toBlob(data.file_data, 'application/pdf');
            const url = window.URL.createObjectURL(blob);
            compressDownloadButton.href = url;
            compressDownloadButton.download = data.filename;
            compressDownloadButtonContainer.style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else {
        alert('Please select a PDF file to compress.');
    }
});

compressDownloadButton.addEventListener('click', function(event) {
    event.stopPropagation();
    compressPdfFile.value = '';
    compressFileNameDisplay.textContent = '';
    compressDownloadButtonContainer.style.display = 'none';
});

function base64toBlob(base64Data, contentType) {
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
}