import axios from '../../node_modules/axios';
import Compressor from '../../node_modules/compressorjs';
 
document.getElementById('file').addEventListener('change', (e) => {
  const file = e.target.files[0];
 
  if (!file) {
    return;
  }
 
  new Compressor(file, {
    quality: 0.6,
    success(result) {
      const formData = new FormData();
 
      // The third parameter is required for server
      formData.append('file', result, result.name);
 
      // Send the compressed image file to server with XMLHttpRequest.
      axios.post('./fotos', formData).then(() => {
        console.log('Upload success');
      });
    },
    error(err) {
      console.log(err.message);
    },
  });
});