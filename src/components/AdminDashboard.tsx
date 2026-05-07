import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Save, 
  LogOut, 
  Camera, 
  Check, 
  Loader2,
  ChevronRight,
  ExternalLink,
  Edit2,
  Code2,
  Briefcase,
  Mail,
  User as UserIcon,
  MessageSquare,
  Clock
} from 'lucide-react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db, logout, handleFirestoreError, OperationType } from '../firebase';
import { cn } from '../utils';

import imageCompression from 'browser-image-compression';

interface AdminDashboardProps {
  user: any;
}

export const AdminDashboard = ({ user }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'skills' | 'hires'>('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hires, setHires] = useState<any[]>([]);

  // Profile State
  const [profile, setProfile] = useState({
    name: "Jahedur Rahman Shuvo",
    title: "Full Stack Web Developer",
    bio: "Passionate about crafting dynamic web experiences and scalable digital solutions.",
    location: "Dhaka, Bangladesh",
    profileImage: "https://i.postimg.cc/Fzc0pSMd/20260505-223351.png",
    email: user.email
  });

  // Projects & Skills State
  const [projects, setProjects] = useState<any[]>([
    {
      id: '1',
      title: 'E-Commerce Platform',
      category: 'Frontend',
      description: 'A modern shopping experience with real-time updates.',
      image: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=800',
      tech: ['React', 'Tailwind', 'Firebase']
    },
    {
      id: '2',
      title: 'Task Management App',
      category: 'Backend',
      description: 'Efficient workflow management for teams.',
      image: 'https://images.unsplash.com/photo-1540350394557-8d14678e7f91?auto=format&fit=crop&q=80&w=800',
      tech: ['Node.js', 'PostgreSQL', 'Redux']
    }
  ]);
  const [skills, setSkills] = useState<any[]>([
    { id: '1', name: 'React', category: 'Frontend', icon: '' },
    { id: '2', name: 'Node.js', category: 'Backend', icon: '' },
    { id: '3', name: 'Tailwind CSS', category: 'Frontend', icon: '' },
    { id: '4', name: 'TypeScript', category: 'Tools', icon: '' }
  ]);

  useEffect(() => {
    // Fetch Profile
    const fetchProfile = async () => {
      const profilePath = 'profile/main';
      try {
        const docRef = doc(db, 'profile', 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(snap => ({ ...snap, ...docSnap.data() }) as any);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, profilePath);
      }
    };

    const projectsPath = 'projects';
    const unsubProjects = onSnapshot(query(collection(db, projectsPath), orderBy('order', 'asc')), (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, projectsPath);
    });

    const skillsPath = 'skills';
    const unsubSkills = onSnapshot(query(collection(db, skillsPath), orderBy('order', 'asc')), (snapshot) => {
      setSkills(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, skillsPath);
    });

    const hiresPath = 'hires';
    const unsubHires = onSnapshot(query(collection(db, hiresPath), orderBy('createdAt', 'desc')), (snapshot) => {
      setHires(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, hiresPath);
    });

    fetchProfile();
    return () => {
      unsubProjects();
      unsubSkills();
      unsubHires();
    };
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const path = 'profile/main';
      await setDoc(doc(db, 'profile', 'main'), {
        ...profile,
        updatedAt: new Date().toISOString()
      });
      alert('Profile updated successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'profile/main');
    }
    setSaving(false);
  };

  const [isCompresing, setIsCompressing] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isProfile: boolean, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressing(true);
        const options = {
          maxSizeMB: 0.1, // 100KB Target
          maxWidthOrHeight: isProfile ? 300 : 1200, // 300x300 for profile
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          callback(reader.result as string);
          setIsCompressing(false);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Compression error:', error);
        setIsCompressing(false);
        alert('Error processing image. Please try a different one.');
      }
    }
  };

  const handleAddProject = async () => {
    const newProject = {
      title: 'New Project',
      category: 'Development',
      description: 'Project description goes here.',
      image: '',
      tech: ['React'],
      order: projects.length,
      createdAt: new Date().toISOString()
    };
    const path = 'projects';
    try {
      await addDoc(collection(db, path), newProject);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Delete this project?')) {
      const path = `projects/${id}`;
      try {
        await deleteDoc(doc(db, 'projects', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  const handleAddSkill = async () => {
    const newSkill = {
      name: 'New Skill',
      category: 'Frontend',
      icon: '',
      order: skills.length
    };
    const path = 'skills';
    try {
      await addDoc(collection(db, path), newSkill);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (confirm('Delete this skill?')) {
      const path = `skills/${id}`;
      try {
        await deleteDoc(doc(db, 'skills', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  const handleDeleteHire = async (id: string) => {
    if (confirm('Delete this hire request?')) {
      const path = `hires/${id}`;
      try {
        await deleteDoc(doc(db, 'hires', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-brand-charcoal pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold mb-2 text-brand-charcoal">Admin Dashboard</h1>
            <p className="text-brand-charcoal font-medium">Welcome back, <span className="text-brand-green font-bold">{user.displayName || user.email}</span></p>
          </div>
          <button 
            onClick={() => logout()}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {(['profile', 'projects', 'skills', 'hires'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-4 px-4 text-sm font-bold uppercase tracking-wider transition-all relative",
                activeTab === tab ? "text-brand-green" : "text-gray-500 hover:text-brand-charcoal"
              )}
            >
              <div className="flex items-center gap-2">
                {tab}
                {tab === 'hires' && hires.length > 0 && (
                  <span className="bg-brand-neon text-black text-[10px] px-1.5 py-0.5 rounded-full">{hires.length}</span>
                )}
              </div>
              {activeTab === tab && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-6 max-w-2xl">
              <div className="flex flex-col items-center sm:flex-row gap-6 mb-8">
                <div className="relative group">
                  <div className="w-[300px] h-[300px] rounded-full overflow-hidden border-4 border-gray-100 bg-gray-50 flex items-center justify-center">
                    {profile.profileImage ? (
                      <img src={profile.profileImage} alt="Profile" className={cn("w-full h-full object-cover", isCompresing && "opacity-50")} />
                    ) : (
                      <Camera size={48} className="text-gray-300" />
                    )}
                    {isCompresing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <Loader2 className="animate-spin text-brand-green" size={32} />
                      </div>
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer disabled:cursor-not-allowed">
                    <Camera size={32} />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      disabled={isCompresing}
                      onChange={(e) => handleImageUpload(e, true, (base64) => setProfile({ ...profile, profileImage: base64 }))} 
                    />
                  </label>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1 text-brand-charcoal">Profile Photo</h3>
                  <p className="text-sm font-medium text-gray-500">Upload a professional headshot. <br />Target size: 300x300 pixels.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-brand-charcoal">Full Name</label>
                  <input 
                    type="text" 
                    value={profile.name} 
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-2 ring-brand-green/20 outline-none transition-all font-bold text-brand-charcoal"
                    placeholder="Jahedur Rahman Shuvo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-brand-charcoal">Job Title</label>
                  <input 
                    type="text" 
                    value={profile.title} 
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-2 ring-brand-green/20 outline-none transition-all font-bold text-brand-charcoal"
                    placeholder="Full Stack Web Developer"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-brand-charcoal">Location</label>
                <input 
                  type="text" 
                  value={profile.location} 
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-2 ring-brand-green/20 outline-none transition-all font-bold text-brand-charcoal"
                  placeholder="Dhaka, Bangladesh"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-brand-charcoal">Bio</label>
                <textarea 
                  value={profile.bio} 
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-2 ring-brand-green/20 outline-none transition-all h-32 font-medium text-brand-charcoal"
                  placeholder="Tell people about yourself..."
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={saving}
                className="cta-button cta-green w-full flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save Changes
              </button>
            </form>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Manage Projects</h3>
                <button 
                  onClick={handleAddProject}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
                >
                  <Plus size={18} />
                  Add Project
                </button>
              </div>

              <div className="grid gap-6">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-6 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-4">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-48 h-32 rounded-xl bg-white border border-gray-100 overflow-hidden relative group">
                        {proj.image ? (
                          <img src={proj.image} alt={proj.title} className={cn("w-full h-full object-cover", isCompresing && "opacity-50")} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Camera size={24} />
                          </div>
                        )}
                        {isCompresing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                            <Loader2 className="animate-spin text-brand-green" size={20} />
                          </div>
                        )}
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <Edit2 size={18} />
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            disabled={isCompresing}
                            onChange={(e) => handleImageUpload(e, false, (base64) => {
                              const updatedProjects = projects.map(p => p.id === proj.id ? { ...p, image: base64 } : p);
                              setProjects(updatedProjects);
                              const path = `projects/${proj.id}`;
                              setDoc(doc(db, 'projects', proj.id), { ...proj, image: base64 })
                                .catch(err => handleFirestoreError(err, OperationType.WRITE, path));
                            })} 
                          />
                        </label>
                      </div>
                      <div className="flex-1 grid md:grid-cols-2 gap-4">
                        <input 
                          type="text" 
                          value={proj.title} 
                          onChange={(e) => {
                            const updated = projects.map(p => p.id === proj.id ? { ...p, title: e.target.value } : p);
                            setProjects(updated);
                            const path = `projects/${proj.id}`;
                            setDoc(doc(db, 'projects', proj.id), { ...proj, title: e.target.value })
                              .catch(err => handleFirestoreError(err, OperationType.WRITE, path));
                          }}
                          className="px-4 py-2 bg-white border-2 border-gray-100 rounded-lg text-sm font-bold text-brand-charcoal"
                          placeholder="Project Title"
                        />
                        <input 
                          type="text" 
                          value={proj.category} 
                          onChange={(e) => {
                            const updated = projects.map(p => p.id === proj.id ? { ...p, category: e.target.value } : p);
                            setProjects(updated);
                            const path = `projects/${proj.id}`;
                            setDoc(doc(db, 'projects', proj.id), { ...proj, category: e.target.value })
                              .catch(err => handleFirestoreError(err, OperationType.WRITE, path));
                          }}
                          className="px-4 py-2 bg-white border-2 border-gray-100 rounded-lg text-sm font-bold text-brand-charcoal"
                          placeholder="Category"
                        />
                        <textarea 
                          value={proj.description} 
                          onChange={(e) => {
                            const updated = projects.map(p => p.id === proj.id ? { ...p, description: e.target.value } : p);
                            setProjects(updated);
                            const path = `projects/${proj.id}`;
                            setDoc(doc(db, 'projects', proj.id), { ...proj, description: e.target.value })
                              .catch(err => handleFirestoreError(err, OperationType.WRITE, path));
                          }}
                          className="md:col-span-2 px-4 py-2 bg-white border-2 border-gray-100 rounded-lg text-sm h-20 font-medium text-brand-charcoal"
                          placeholder="Short description..."
                        />
                      </div>

                      <div className="flex flex-row md:flex-col gap-2 justify-center">
                        <button 
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-3 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Manage Skills</h3>
                <button 
                  onClick={handleAddSkill}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
                >
                  <Plus size={18} />
                  Add Skill
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {skills.map((skill) => (
                  <div key={skill.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 p-2 relative group/img">
                      {skill.icon ? (
                        <img src={skill.icon} alt={skill.name} className={cn("w-full h-full object-contain", isCompresing && "opacity-50")} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Code2 size={24} />
                        </div>
                      )}
                      {isCompresing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                          <Loader2 className="animate-spin text-brand-green" size={14} />
                        </div>
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer rounded-lg">
                        <Edit2 size={12} />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          disabled={isCompresing}
                          onChange={(e) => handleImageUpload(e, false, (base64) => {
                            const updatedSkills = skills.map(s => s.id === skill.id ? { ...s, icon: base64 } : s);
                            setSkills(updatedSkills);
                            const path = `skills/${skill.id}`;
                            setDoc(doc(db, 'skills', skill.id), { ...skill, icon: base64 })
                              .catch(err => handleFirestoreError(err, OperationType.WRITE, path));
                          })} 
                        />
                      </label>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        value={skill.name} 
                        onChange={(e) => {
                          const updated = skills.map(s => s.id === skill.id ? { ...s, name: e.target.value } : s);
                          setSkills(updated);
                          const path = `skills/${skill.id}`;
                          setDoc(doc(db, 'skills', skill.id), { ...skill, name: e.target.value })
                            .catch(err => handleFirestoreError(err, OperationType.WRITE, path));
                        }}
                        className="px-3 py-1.5 bg-white border-2 border-gray-100 rounded-lg text-xs font-bold text-brand-charcoal"
                        placeholder="Skill Name"
                      />
                      <select 
                        value={skill.category}
                        onChange={(e) => {
                          const updated = skills.map(s => s.id === skill.id ? { ...s, category: e.target.value } : s);
                          setSkills(updated);
                          const path = `skills/${skill.id}`;
                          setDoc(doc(db, 'skills', skill.id), { ...skill, category: e.target.value })
                            .catch(err => handleFirestoreError(err, OperationType.WRITE, path));
                        }}
                        className="px-3 py-1.5 bg-white border-2 border-gray-100 rounded-lg text-xs font-bold text-brand-charcoal"
                      >
                        <option value="Frontend">Frontend</option>
                        <option value="Backend">Backend</option>
                        <option value="Tools">Tools</option>
                      </select>
                    </div>
                    <button 
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="p-2 text-red-100 bg-red-400 rounded-lg hover:bg-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'hires' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-brand-charcoal mb-6">Hire Requests</h3>
              {hires.length > 0 ? (
                <div className="grid gap-4">
                  {hires.map((hire) => (
                    <motion.div 
                      key={hire.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-6 border-2 border-gray-100 rounded-2xl bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-brand-green/20 transition-all"
                    >
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
                            <UserIcon size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-brand-charcoal leading-none">{hire.name}</h4>
                            <div className="flex items-center gap-2 mt-2 text-brand-green font-bold text-sm">
                              <Mail size={14} />
                              {hire.email}
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm">
                          <div className="flex items-start gap-3">
                            <MessageSquare size={16} className="text-brand-charcoal mt-1 shrink-0" />
                            <p className="text-brand-charcoal text-sm leading-relaxed font-medium">{hire.message}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest pl-1">
                          <Clock size={12} />
                          {hire.createdAt?.toDate?.() ? hire.createdAt.toDate().toLocaleString() : new Date().toLocaleString()}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteHire(hire.id)}
                        className="p-3 text-red-100 bg-red-500 rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={20} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <Briefcase size={32} />
                  </div>
                  <p className="text-gray-500 font-bold text-lg">No hire requests found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
