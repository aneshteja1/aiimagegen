import React, { useState } from 'react';
import useAuthStore from '../store/authStore';
import { jobsApi } from '../services/api';
import '../styles/forms.css'; // We will create this sleek CSS file next

export default function BulkUpload() {
  const { user } = useAuthStore();
  const [file, setFile] = useState(null);
  const [jobType, setJobType] = useState('image_gen');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus('Please select a ZIP file first.');
      return;
    }

    setLoading(true);
    setStatus('Uploading and calculating credits...');

    try {
      // Note: In a real app with ZIP files, you'd use FormData to upload to AWS S3 or a storage bucket first,
      // then pass the file URL to your backend. For this setup, we simulate passing the file URL.
      const payload = {
        type: jobType,
        fileUrls: ['s3://vt-bucket/uploads/' + file.name] 
      };

      const res = await jobsApi.generateBulk(payload);
      setStatus(`Success! Batch queued. Job ID: ...${res.data.id.slice(-8)}`);
      setFile(null); // Reset form
    } catch (err) {
      setStatus(`Error: ${err.error || 'Failed to queue batch.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-card">
        <div className="form-header">
          <h2>Bulk Image Processing</h2>
          <p>Upload 100–500 product images for batch AI generation[cite: 108, 109, 110].</p>
        </div>

        <form onSubmit={handleSubmit} className="vt-form">
          <div className="form-group">
            <label>Generation Type</label>
            <select 
              value={jobType} 
              onChange={(e) => setJobType(e.target.value)}
              className="vt-input"
            >
              <option value="image_gen">AI Image Generation (5 Credits/img)</option>
              <option value="swap_model">AI Model Swap (2 Credits/img)</option>
              <option value="try_on">Virtual Try-On (3 Credits/img)</option>
            </select>
          </div>

          <div className="form-group drag-drop-zone">
            <label htmlFor="zip-upload" className="file-label">
              {file ? file.name : 'Click to select a .ZIP file'}
            </label>
            <input 
              id="zip-upload"
              type="file" 
              accept=".zip" 
              onChange={handleFileChange} 
              style={{ display: 'none' }}
            />
          </div>

          <button 
            type="submit" 
            className="vt-button primary" 
            disabled={loading || !file}
          >
            {loading ? 'Processing...' : 'Upload & Queue Batch'}
          </button>

          {status && (
            <div className={`status-message ${status.includes('Error') ? 'error' : 'success'}`}>
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
