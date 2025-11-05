import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import { profileAPI } from '../services/api';

function Profile() {
  const { isAuthenticated, setShowLoginModal, showLoginModal, logout, user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [experience, setExperience] = useState(0);
  const [education, setEducation] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [cvPath, setCvPath] = useState<string | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setMessage('Invalid file type. Only PDF and Word documents are allowed.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('File is too large. Maximum size is 5MB.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setCvUploading(true);
    setMessage('');

    try {
      const response = await profileAPI.uploadCV(file);
      setCvPath(response.cvPath);
      setMessage('CV uploaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error uploading CV:', error);
      setMessage(error.response?.data?.error || 'Failed to upload CV');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setCvUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleCVDelete = async () => {
    if (!confirm('Are you sure you want to delete your CV?')) {
      return;
    }

    try {
      await profileAPI.deleteCV();
      setCvPath(null);
      setMessage('CV deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error deleting CV:', error);
      setMessage(error.response?.data?.error || 'Failed to delete CV');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleCVDownload = async () => {
    try {
      const blob = await profileAPI.getCV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'CV.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error downloading CV:', error);
      setMessage(error.response?.data?.error || 'Failed to download CV');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      // Load existing profile
      loadProfile();
    }
  }, [isAuthenticated, user]);

  // Update name field when user.fullName changes
  useEffect(() => {
    if (user?.fullName) {
      setName(user.fullName);
    }
  }, [user?.fullName]);

  const loadProfile = async () => {
    try {
      const profile = await profileAPI.getProfile();
      if (profile) {
        setName(user?.fullName || '');
        setSkills(profile.skills || []);
        setExperience(profile.experience || 0);
        setEducation(profile.education || '');
        setLocation(profile.location || '');
        setPhone(profile.phone || '');
        setCvPath(profile.cvPath || null);
        setBio(profile.bio || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await profileAPI.updateProfile({
        fullName: name,
        skills,
        experience,
        education,
        location,
        phone,
        bio,
      });
      setMessage('Profile saved successfully!');
      setTimeout(() => setMessage(''), 3000);
      // Reload user data to get updated name
      // This will trigger the useEffect that watches user.fullName and update the name field
      await refreshUser();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setMessage(error.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="max-w-4xl mx-auto text-center py-16">
          <h1 className="text-4xl font-bold text-dark-heading mb-6">My Profile</h1>
          <div className="bg-mocca-100 p-12 rounded-lg shadow-md border border-mocca-200">
            <p className="text-dark-text text-lg mb-6">
              Please sign in to access your profile
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-mocca-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-mocca-500 transition-colors shadow-md hover:shadow-lg"
            >
              Sign In
            </button>
          </div>
        </div>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-dark-heading">My Profile</h1>
            <button
              onClick={logout}
              className="bg-mocca-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-mocca-700 transition-colors"
            >
              Logout
            </button>
          </div>

          {user && (
            <div className="mb-6 p-4 bg-champagne rounded-lg">
              <p className="text-dark-text">
                <strong>Logged in as:</strong> {user.fullName} ({user.email})
              </p>
            </div>
          )}

          <div className="bg-mocca-100 p-8 rounded-lg shadow-md border border-mocca-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div>
                <h2 className="text-2xl font-bold text-dark-heading mb-4">Basic Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-dark-text font-semibold mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-dark-text font-semibold mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
                      placeholder="e.g., Oslo, Norway"
                    />
                  </div>

                  <div>
                    <label className="block text-dark-text font-semibold mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
                      placeholder="e.g., +47 123 45 678"
                    />
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h2 className="text-2xl font-bold text-dark-heading mb-4">Skills</h2>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
                    placeholder="Add a skill"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-6 py-2 bg-mocca-400 text-white rounded-lg font-semibold hover:bg-mocca-500 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-mocca-200 px-3 py-1 rounded-full text-dark-text font-medium flex items-center gap-2"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-mocca-600 hover:text-mocca-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience & Education */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-text font-semibold mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-dark-text font-semibold mb-2">
                    Education
                  </label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
                    placeholder="e.g., Bachelor in Computer Science"
                  />
                </div>
              </div>

              {/* CV Upload */}
              <div>
                <h2 className="text-2xl font-bold text-dark-heading mb-4">CV Upload</h2>
                <div className="border-2 border-dashed border-mocca-300 rounded-lg p-6">
                  {cvPath ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="text-dark-text font-semibold">CV uploaded</p>
                          <p className="text-dark-secondary text-sm">
                            {cvPath.split('/').pop()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleCVDownload}
                            className="bg-mocca-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-mocca-500 transition-colors"
                          >
                            Download
                          </button>
                          <button
                            type="button"
                            onClick={handleCVDelete}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-dark-text font-semibold mb-2">
                          Replace CV
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleCVUpload}
                          disabled={cvUploading}
                          className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-dark-text font-semibold mb-2">
                        Upload your CV
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleCVUpload}
                        disabled={cvUploading}
                        className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
                      />
                      <p className="text-dark-secondary text-sm mt-2">
                        Accepted formats: PDF, DOC, DOCX (max 5MB)
                      </p>
                      {cvUploading && (
                        <p className="text-mocca-600 mt-2">Uploading...</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-dark-text font-semibold mb-2">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400 resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

            {/* Submit */}
            {message && (
              <div className={`p-4 rounded-lg mb-4 ${
                message.includes('successfully') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-mocca-400 text-white py-3 rounded-lg font-semibold hover:bg-mocca-500 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
            </form>
          </div>
        </motion.div>
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}

export default Profile;
