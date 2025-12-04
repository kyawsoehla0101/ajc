// src/components/EditSummaryModal.jsx
import React from "react";

export default function EditSummaryModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-start justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl mt-10 p-6 animate-slideDown">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Personal Summary</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <label className="block font-semibold mb-2">Summary</label>
        <p className="mb-2">Brief personal experience</p>
        <textarea
          rows="6"
          placeholder="Textarea Write"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        ></textarea>

        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Save
          </button>
          <button
            type="button"
            className="bg-blue-100 text-blue-600 px-6 py-2 rounded-lg"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
