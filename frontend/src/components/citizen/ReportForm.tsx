import React, { useState, useRef } from 'react';
import { MapPin, CheckCircle, ChevronLeft, ChevronRight, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { LocationPicker } from '../map/LocationPicker';

export interface Location {
  lat: number;
  lng: number;
}

export interface ReportFormData {
  description: string;
  location: Location | null;
  photoUrl: string | null;
  photoFile?: File | null;
  photoPreview?: string | null;
  category: string;
}

interface ReportFormProps {
  onSubmit: (data: ReportFormData) => void;
  isSubmitting?: boolean;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const [step, setStep] = useState(1);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ReportFormData>({
    description: '',
    location: null,
    photoUrl: null,
    photoFile: null,
    photoPreview: null,
    category: 'Auto-detected',
  });

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setFileError('Only JPEG, PNG, WebP, or GIF image files are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError('Image file size must be under 10MB.');
      return;
    }

    setFileError(null);
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      photoFile: file,
      photoPreview: previewUrl,
    }));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setFileError('Only JPEG, PNG, WebP, or GIF image files are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError('Image file size must be under 10MB.');
      return;
    }

    setFileError(null);
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      photoFile: file,
      photoPreview: previewUrl,
    }));
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (formData.photoPreview) {
      URL.revokeObjectURL(formData.photoPreview);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFormData((prev) => ({
      ...prev,
      photoFile: null,
      photoPreview: null,
      photoUrl: null,
    }));
    setFileError(null);
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#F1F5F9] -z-10 rounded"></div>
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#2563EB] -z-10 rounded transition-all duration-300"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        ></div>

        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm transition-colors ${
                step >= s ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9] text-[#64748B]'
              }`}
            >
              {s}
            </div>
            <span className="text-xs text-[#64748B] mt-2 hidden sm:block">
              {s === 1 ? 'Describe' : s === 2 ? 'Location' : 'Review'}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Describe */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-[#0F172A]">Describe the issue</h2>
          <div>
            <label className="block text-sm font-medium text-[#475569] mb-2">Description</label>
            <textarea
              className="w-full p-3 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none min-h-[120px] text-[#0F172A]"
              placeholder="Describe what is happening..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#475569] mb-2">Photo (Optional)</label>

            {/* Hidden real file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />

            {formData.photoPreview ? (
              <div className="border border-[#E2E8F0] rounded-lg p-4 bg-[#F8FAFC] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={formData.photoPreview}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-md border border-[#E2E8F0]"
                  />
                  <div>
                    <p className="text-sm font-medium text-[#0F172A] truncate max-w-[200px] sm:max-w-[280px]">
                      {formData.photoFile?.name || 'Selected Image'}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {formData.photoFile ? `${(formData.photoFile.size / 1024).toFixed(1)} KB` : ''}
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-[#2563EB] font-medium hover:underline mt-1"
                    >
                      Replace photo
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="p-2 text-[#94A3B8] hover:text-[#DC2626] rounded-full hover:bg-white transition-colors"
                  title="Remove photo"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-[#E2E8F0] rounded-lg p-8 flex flex-col items-center justify-center text-[#64748B] bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <Upload className="w-8 h-8 mb-2 text-[#475569]" />
                <span className="text-sm font-medium text-[#0F172A]">Click or drag photo here</span>
                <span className="text-xs text-[#94A3B8] mt-1">PNG, JPG, WebP up to 10MB</span>
              </div>
            )}

            {fileError && <p className="text-xs text-[#DC2626] mt-1.5">{fileError}</p>}
          </div>
        </div>
      )}

      {/* Step 2: Location */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-[#0F172A]">Set Location</h2>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      setFormData({
                        ...formData,
                        location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
                      });
                    },
                    () => {
                      // fallback to default Rewa coords if permission denied
                      setFormData({
                        ...formData,
                        location: { lat: 24.534, lng: 81.2965 },
                      });
                    }
                  );
                }
              }}
              className="flex items-center text-sm text-[#2563EB] font-medium hover:text-[#1D4ED8]"
            >
              <MapPin className="w-4 h-4 mr-1" /> Use My Location
            </button>
          </div>
          <div className="h-[300px] rounded-lg border border-[#E2E8F0] overflow-hidden bg-[#F8FAFC]">
            <LocationPicker
              initialLat={formData.location?.lat}
              initialLng={formData.location?.lng}
              onLocationSelect={(lat, lng) => setFormData({ ...formData, location: { lat, lng } })}
            />
          </div>
          {formData.location && (
            <p className="text-sm text-[#475569]">
              Selected: {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
            </p>
          )}
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-[#0F172A]">Review & Submit</h2>
          <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0] space-y-4">
            <div>
              <h3 className="text-sm font-medium text-[#475569]">Description</h3>
              <p className="text-[#0F172A] mt-1">{formData.description || 'No description provided.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-[#475569]">Detected Category</h3>
                <span className="inline-block px-2 py-1 bg-blue-50 text-[#2563EB] text-xs font-medium rounded mt-1">
                  {formData.category}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#475569]">AI Priority Assessment</h3>
                <span className="inline-block px-2 py-1 bg-yellow-50 text-[#F59E0B] text-xs font-medium rounded mt-1">
                  Automated by RIWA AI
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[#475569]">Location</h3>
              <p className="text-[#0F172A] mt-1 flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-[#64748B]" />
                {formData.location
                  ? `${formData.location.lat.toFixed(4)}, ${formData.location.lng.toFixed(4)}`
                  : 'Rewa Center (Default)'}
              </p>
            </div>

            {formData.photoPreview && (
              <div>
                <h3 className="text-sm font-medium text-[#475569] mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#64748B]" /> Attached Evidence
                </h3>
                <div className="rounded-lg overflow-hidden border border-[#E2E8F0] max-w-xs">
                  <img src={formData.photoPreview} alt="Attached photo" className="w-full h-36 object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-4 border-t border-[#E2E8F0]">
        <button
          type="button"
          onClick={prevStep}
          disabled={step === 1 || isSubmitting}
          className={`flex items-center px-4 py-2 rounded-lg font-medium ${
            step === 1 || isSubmitting
              ? 'text-[#94A3B8] cursor-not-allowed'
              : 'text-[#475569] hover:bg-[#F1F5F9]'
          }`}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={nextStep}
            className="flex items-center px-4 py-2 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-[#1D4ED8] transition-colors"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.description.trim()}
            className={`flex items-center px-6 py-2 bg-[#16A34A] text-white rounded-lg font-medium hover:bg-[#15803D] transition-colors ${
              isSubmitting || !formData.description.trim() ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                Submit Report <CheckCircle className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
