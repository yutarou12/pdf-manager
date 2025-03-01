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