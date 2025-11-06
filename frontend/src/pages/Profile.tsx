import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import { profileAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { validateName, validatePhone, validateExperience } from '../utils/validation';
import { ProfileFormSkeleton } from '../components/Skeleton';
import exitIcon from '../assets/images/exit.png';

function Profile() {
  const { isAuthenticated, setShowLoginModal, showLoginModal, logout, user, refreshUser } = useAuth();
  const { showToast } = useToast();
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
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; experience?: string }>({});

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
      showToast('Ugyldig filtype. Kun PDF og Word dokumenter er tillatt.', 'error');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Filen er for stor. Maksimal størrelse er 5MB.', 'error');
      return;
    }

    setCvUploading(true);

    try {
      const response = await profileAPI.uploadCV(file);
      setCvPath(response.cvPath);
      showToast('CV lastet opp!', 'success');
    } catch (error: any) {
      console.error('Error uploading CV:', error);
      showToast(error.response?.data?.error || 'Kunne ikke laste opp CV', 'error');
    } finally {
      setCvUploading(false);
      e.target.value = '';
    }
  };

  const handleCVDelete = async () => {
    if (!confirm('Er du sikker på at du vil slette CV-en din?')) {
      return;
    }

    try {
      await profileAPI.deleteCV();
      setCvPath(null);
      showToast('CV slettet!', 'success');
    } catch (error: any) {
      console.error('Error deleting CV:', error);
      showToast(error.response?.data?.error || 'Kunne ikke slette CV', 'error');
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
      showToast('CV lastet ned!', 'success');
    } catch (error: any) {
      console.error('Error downloading CV:', error);
      showToast(error.response?.data?.error || 'Kunne ikke laste ned CV', 'error');
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
    setLoadingProfile(true);
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
      showToast('Kunne ikke laste profil', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // Validate form
    const newErrors: { name?: string; phone?: string; experience?: string } = {};
    
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      newErrors.name = nameValidation.error;
    }
    
    if (phone) {
      const phoneValidation = validatePhone(phone);
      if (!phoneValidation.valid) {
        newErrors.phone = phoneValidation.error;
      }
    }
    
    const experienceValidation = validateExperience(experience);
    if (!experienceValidation.valid) {
      newErrors.experience = experienceValidation.error;
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      showToast('Vennligst rett feilene i skjemaet', 'error');
      return;
    }

    setLoading(true);

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
      showToast('Profil lagret!', 'success');
      await refreshUser();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      showToast(error.response?.data?.error || 'Kunne ikke lagre profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="max-w-4xl mx-auto text-center py-16">
          <h1 className="text-4xl font-bold text-dark-heading mb-6">Min profil</h1>
          <div className="bg-mocca-100 p-12 rounded-lg shadow-md border border-mocca-200">
            <p className="text-dark-text text-lg mb-6">
              Vennligst logg inn for å få tilgang til profilen din
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-mocca-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-mocca-500 transition-colors shadow-md hover:shadow-lg"
            >
              Logg inn
            </button>
          </div>
        </div>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </>
    );
  }

  if (loadingProfile) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-dark-heading mb-6">Min profil</h1>
        <ProfileFormSkeleton />
      </div>
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
            <h1 className="text-4xl font-bold text-dark-heading">Min profil</h1>
            <button
              onClick={logout}
              className="bg-mocca-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-mocca-700 transition-colors flex items-center gap-2"
              aria-label="Logg ut"
            >
              <img src={exitIcon} alt="Logout" className="w-5 h-5" />
              Logg ut
            </button>
          </div>

          {user && (
            <div className="mb-6 p-4 bg-champagne rounded-lg">
              <p className="text-dark-text">
                <strong>Innlogget som:</strong> {user.fullName} ({user.email})
              </p>
            </div>
          )}

          <div className="bg-mocca-100 p-8 rounded-lg shadow-md border border-mocca-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div>
                <h2 className="text-2xl font-bold text-dark-heading mb-4">Grunnleggende informasjon</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-dark-text font-semibold mb-2">
                      Fullt navn
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) {
                          setErrors({ ...errors, name: undefined });
                        }
                      }}
                      className={`w-full px-4 py-2 rounded-lg border bg-white text-dark-text focus:outline-none ${
                        errors.name ? 'border-red-500' : 'border-mocca-300 focus:border-mocca-400'
                      }`}
                      placeholder="Skriv inn ditt fulle navn"
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-dark-text font-semibold mb-2">
                      Sted
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
                      placeholder="F.eks. Oslo, Norge"
                    />
                  </div>

                  <div>
                    <label className="block text-dark-text font-semibold mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) {
                          setErrors({ ...errors, phone: undefined });
                        }
                      }}
                      className={`w-full px-4 py-2 rounded-lg border bg-white text-dark-text focus:outline-none ${
                        errors.phone ? 'border-red-500' : 'border-mocca-300 focus:border-mocca-400'
                      }`}
                      placeholder="F.eks. +47 123 45 678"
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                    )}
                    {!errors.phone && phone && (
                      <p className="text-dark-secondary text-xs mt-1">Format: +47 123 45 678 eller 123 45 678</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h2 className="text-2xl font-bold text-dark-heading mb-4">Ferdigheter</h2>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
                    placeholder="Legg til en ferdighet"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-6 py-2 bg-mocca-400 text-white rounded-lg font-semibold hover:bg-mocca-500 transition-colors"
                  >
                    Legg til
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
                    Års erfaring
                  </label>
                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setExperience(value);
                      if (errors.experience) {
                        setErrors({ ...errors, experience: undefined });
                      }
                    }}
                    className={`w-full px-4 py-2 rounded-lg border bg-white text-dark-text focus:outline-none ${
                      errors.experience ? 'border-red-500' : 'border-mocca-300 focus:border-mocca-400'
                    }`}
                    min="0"
                    max="50"
                  />
                  {errors.experience && (
                    <p className="text-red-600 text-sm mt-1">{errors.experience}</p>
                  )}
                </div>

                <div>
                  <label className="block text-dark-text font-semibold mb-2">
                    Utdanning
                  </label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
                    placeholder="F.eks. Bachelor i Informatikk"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-mocca-400 text-white py-3 rounded-lg font-semibold hover:bg-mocca-500 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Lagrer...' : 'Lagre profil'}
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
