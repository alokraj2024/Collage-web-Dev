import React, { useState, useEffect } from 'react';

// Platform Configuration Object
const PLATFORM_CONFIGS = {
  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    maxChars: 280,
    maxHashtags: 5,
    requiresMedia: false,
    color: 'bg-blue-500',
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    maxChars: 2200,
    maxHashtags: 30,
    requiresMedia: true,
    color: 'bg-pink-600',
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    maxChars: 5000, // Generous standard limit for clarity
    maxHashtags: 10,
    requiresMedia: false,
    color: 'bg-blue-700',
  }
};

export default function PostComposer() {
  // State Management
  const [text, setText] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [media, setMedia] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  // Helper to extract hashtag count
  const getHashtagCount = (str) => {
    const hashtags = str.match(/#\w+/g);
    return hashtags ? hashtags.length : 0;
  };

  // Toggle platform selection
  const handlePlatformToggle = (platformId) => {
    if (selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms(selectedPlatforms.filter(id => id !== platformId));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId]);
    }
  };

  // Handle mock media attachment
  const handleMediaChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setMedia(e.target.files[0]);
    } else {
      setMedia(null);
    }
  };

  // Real-time validation effect
  useEffect(() => {
    const currentErrors = {};
    const hashtagCount = getHashtagCount(text);

    if (selectedPlatforms.length === 0) {
      currentErrors.global = 'Please select at least one target platform.';
    }

    selectedPlatforms.forEach((platformId) => {
      const config = PLATFORM_CONFIGS[platformId];
      const platformErrors = [];

      // Character length validation
      if (text.length > config.maxChars) {
        platformErrors.push(`Exceeds maximum limit of ${config.maxChars} characters.`);
      }

      // Hashtag validation
      if (hashtagCount > config.maxHashtags) {
        platformErrors.push(`Exceeds maximum limit of ${config.maxHashtags} hashtags (Current: ${hashtagCount}).`);
      }

      // Media validation
      if (config.requiresMedia && !media) {
        platformErrors.push(`Media attachment is required for this platform.`);
      }

      if (platformErrors.length > 0) {
        currentErrors[platformId] = platformErrors;
      }
    });

    setErrors(currentErrors);

    // Form submission is blocked if there are platform errors, no platform selected, or text is empty
    const hasErrors = Object.keys(currentErrors).length > 0;
    setIsSubmitDisabled(hasErrors || text.trim() === '');
  }, [text, selectedPlatforms, media]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Post successfully composed and passed multi-platform validation!');
    // Handle submission workflow here
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-200 mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Dynamic Post Composer</h2>
      <p className="text-sm text-gray-600 mb-6">Experiment 1.1.1: Multi-Platform Validation Engine</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Platform Selection Component */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Target Platforms:</label>
          <div className="flex gap-4">
            {Object.values(PLATFORM_CONFIGS).map((platform) => {
              const isChecked = selectedPlatforms.includes(platform.id);
              return (
                <label 
                  key={platform.id} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all select-none ${
                    isChecked 
                      ? `${platform.color} text-white border-transparent shadow-sm` 
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={isChecked}
                    onChange={() => handlePlatformToggle(platform.id)}
                  />
                  <span>{platform.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Text Area Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Compose Post Content:</label>
          <textarea
            className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            placeholder="Type your content, include links, or add hashtags here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {/* Media Upload Area */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Attach Media Component:</label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {media && (
            <p className="text-xs text-green-600 mt-1 font-medium">
              ✓ Attached: {media.name} ({(media.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <hr className="border-gray-200" />

        {/* Dynamic Metric Framework / Trackers */}
        {selectedPlatforms.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Live Status & Counters</h3>
            {selectedPlatforms.map((platformId) => {
              const config = PLATFORM_CONFIGS[platformId];
              const remaining = config.maxChars - text.length;
              const hasPlatformError = !!errors[platformId];

              // Counter color code changes as characters approach boundaries
              let counterColor = 'text-green-600';
              if (remaining < 0) counterColor = 'text-red-600 font-bold';
              else if (remaining < 20) counterColor = 'text-yellow-600 font-semibold';

              return (
                <div key={platformId} className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
                  <span className="text-sm font-medium text-gray-700">{config.name}</span>
                  <div className="flex gap-4 items-center text-xs">
                    <span className={counterColor}>
                      {remaining} / {config.maxChars} chars left
                    </span>
                    <span className={getHashtagCount(text) > config.maxHashtags ? 'text-red-500 font-bold' : 'text-gray-500'}>
                      Hashtags: {getHashtagCount(text)}/{config.maxHashtags}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dynamic Warning and Error Messages Output Container */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg space-y-1">
            <p className="text-sm font-semibold text-red-800">Validation System Warnings:</p>
            <ul className="list-disc pl-5 space-y-1">
              {Object.entries(errors).map(([key, value]) => {
                if (key === 'global') return <li key={key} className="text-xs text-red-700">{value}</li>;
                return value.map((err, idx) => (
                  <li key={`${key}-${idx}`} className="text-xs text-red-700">
                    <strong>{PLATFORM_CONFIGS[key]?.name}:</strong> {err}
                  </li>
                ));
              })}
            </ul>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all shadow-md ${
            isSubmitDisabled
              ? 'bg-gray-300 cursor-not-allowed shadow-none'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400'
          }`}
        >
          Publish Structured Content
        </button>
      </form>
    </div>
  );
}