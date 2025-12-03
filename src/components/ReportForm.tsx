import { useEffect, useRef, useState } from 'react';
import { uploadImage } from '../api/uploads.ts';
import { getBackendUrl } from "../helpers/backend.ts";

const createDefaultForm = () => ({
  name: '',
  content: '',
  location: '',
  attachments: [],
  status: 'Open',
  tags: []
});

function ReportForm({ onSubmit, submitting, initialData }) {
  const [form, setForm] = useState(() => createDefaultForm());
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      const initialImages = Array.isArray(initialData.images)
        ? initialData.images
        : typeof initialData.images === 'string'
        ? initialData.images
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      setForm({
        name: initialData.name || '',
        content: initialData.content || '',
        location: initialData.location || '',
        attachments: initialImages,
        status: initialData.status || 'Open',
        tags: initialData.tags || []
      });
    } else {
      setForm(createDefaultForm());
    }

    setNewImageUrl('');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      images: form.attachments.filter(Boolean),
    };
    onSubmit(payload);
  };

  const handleAddImageUrl = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    setForm((prev) =>
      prev.attachments.includes(trimmed)
        ? prev
        : { ...prev, images: [...prev.attachments, trimmed] }
    );
    setNewImageUrl('');
  };

  const handleRemoveImage = (imageUrl) => {
    setForm((prev) => ({ ...prev, images: prev.attachments.filter((url) => url !== imageUrl) }));
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    setUploadError('');
    setUploading(true);

    try {
      const response = await uploadImage(file);
      if (response?.url) {
        setForm((prev) =>
          prev.attachments.includes(response.url)
            ? prev
            : { ...prev, images: [...prev.attachments, response.url] }
        );
      }
    } catch (error) {
      const message = error.response?.data?.detail || 'Image upload failed';
      setUploadError(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid" noValidate>
      <div className="form-field">
        <label htmlFor="title">Report title</label>
        <input
          id="title"
          type="text"
          name="name"
          placeholder="Describe the issue in a sentence"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="content">Summary</label>
        <textarea
          id="content"
          name="content"
          placeholder="Share what happened, why it matters, and next steps you recommend."
          value={form.content}
          onChange={handleChange}
          required
          rows={4}
        />
      </div>

      <div className="grid-two">
        <div className="form-field">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            name="location"
            placeholder="City, facility, or region"
            value={form.location}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="status">Current status</label>
          <select id="status" name="status" value={form.status} onChange={handleChange}>
            {['Open', 'In Progress', 'Resolved', 'Pending'].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="imageUpload">Upload an image</label>
        <input
          id="imageUpload"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUploadImage}
          disabled={uploading || submitting}
        />
        <p className="form-help">Up to 5 MB per image. Accepted types: JPG, PNG, GIF, WEBP.</p>
        {uploading && <p className="form-help">Uploading image...</p>}
      </div>

      <div className="form-field">
        <label htmlFor="imageUrl">Add image from URL</label>
        <div className="form-inline">
          <input
            id="imageUrl"
            type="url"
            name="imageUrl"
            placeholder="https://example.com/image.jpg"
            value={newImageUrl}
            onChange={(event) => setNewImageUrl(event.target.value)}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleAddImageUrl}
            disabled={!newImageUrl.trim() || uploading || submitting}
          >
            Add
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="alert alert-error" role="alert">
          {uploadError}
        </div>
      )}

      {form.attachments.length > 0 && (
        <div className="image-gallery">
          {form.attachments.map((image) => {
            const resolvedUrl = getBackendUrl(image);
            return (
              <div key={image} className="image-thumb-wrapper">
                <a href={resolvedUrl} target="_blank" rel="noreferrer">
                  <img src={resolvedUrl} alt="Report supporting" className="image-thumb" />
                </a>
                <button type="button" className="btn btn-ghost" onClick={() => handleRemoveImage(image)}>
                Remove
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div>
        <button type="submit" className="btn btn-primary" disabled={submitting || uploading}>
          {submitting ? 'Saving...' : 'Save report'}
        </button>
      </div>
    </form>
  );
}

export default ReportForm;
