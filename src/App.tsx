import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  ArrowRight, 
  Code2, 
  Cpu, 
  Globe, 
  ExternalLink, 
  CheckCircle2, 
  Menu, 
  X,
  Database,
  Layout,
  Terminal,
  Trello,
  Figma,
  Slack,
  Layers,
  LogIn,
  Loader2
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { cn } from './utils';
import { auth, db, loginWithGoogle, handleFirestoreError, OperationType } from './firebase';
import { AdminDashboard } from './components/AdminDashboard';

// --- Types ---
interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  tech: string[];
  demoUrl?: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  icon: string;
}

interface Profile {
  name: string;
  title: string;
  bio: string;
  location: string;
  profileImage: string;
}

// --- Components ---

const HireModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const path = 'hires';
      await addDoc(collection(db, path), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setFormData({ name: '', email: '', message: '' });
        onClose();
      }, 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'hires');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-brand-charcoal border border-white/10 rounded-3xl p-8 shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white">
              <X size={20} />
            </button>

            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-brand-neon/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="text-brand-neon" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-white/60">Thank you for Reaching out. I'll get back to you soon.</p>
              </div>
            ) : (
              <>
                <h3 className="text-3xl font-bold text-white mb-2">Hire Me</h3>
                <p className="text-white/40 mb-8">Discuss your project and let's build something amazing together.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Your Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 ring-brand-neon/20 outline-none transition-all placeholder:text-white/10"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 ring-brand-neon/20 outline-none transition-all placeholder:text-white/10"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Message</label>
                    <textarea 
                      required
                      rows={4}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 ring-brand-neon/20 outline-none transition-all placeholder:text-white/10 resize-none"
                      placeholder="Tell me about your project..."
                    />
                  </div>
                  <button 
                    disabled={submitting}
                    className="cta-button cta-green w-full py-4 text-sm flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Navbar = ({ user, isAdmin, onDashboardClick, onHireClick }: { user: any, isAdmin: boolean, onDashboardClick: () => void, onHireClick: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'About', href: '#about' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Services', href: '#services' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
      isScrolled ? "bg-brand-charcoal/80 backdrop-blur-xl border-b border-white/5 py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="https://i.postimg.cc/Fzc0pSMd/20260505-223351.png" 
            alt="Jahedur Rahman Logo" 
            className="h-10 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="text-white font-bold text-xl tracking-tight">Jahedur Rahman <span className="text-brand-neon">Shuvo</span></div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-[11px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
            >
              {link.name}
            </a>
          ))}
          {isAdmin && (
            <button onClick={onDashboardClick} className="text-[11px] font-bold uppercase tracking-widest text-brand-neon">Dashboard</button>
          )}
          <button 
            onClick={onHireClick}
            className="cta-button cta-green text-xs px-6 py-2 rounded-full"
          >
            Hire Me
          </button>
        </div>

        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-brand-charcoal border-b border-white/5 p-6 flex flex-col gap-4 md:hidden"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="text-lg font-medium text-white/70 hover:text-brand-neon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            {isAdmin && (
              <button 
                onClick={() => {
                  onDashboardClick();
                  setIsMobileMenuOpen(false);
                }} 
                className="text-left py-2 text-lg font-bold uppercase tracking-widest text-brand-neon border-t border-white/5 pt-4"
              >
                Dashboard
              </button>
            )}
            <button 
              onClick={() => {
                onHireClick();
                setIsMobileMenuOpen(false);
              }}
              className="cta-button cta-green w-full"
            >
              Hire Me
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const HeroSection = ({ profile, onHireClick }: { profile: Profile | null, onHireClick: () => void }) => {
  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden min-h-[90vh] flex items-center hero-gradient">
      <div className="absolute inset-0 z-0 code-overlay pointer-events-none" />
      
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-extrabold leading-[1.1] mb-6">
              Crafting <span className="text-[#39FF14]">Dynamic</span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39FF14] to-emerald-300">Web Experiences</span>
            </h1>
            
            <p className="text-gray-100 text-lg md:text-xl max-w-md mb-10 leading-relaxed font-medium">
              Hi, I'm {profile?.name || 'Jahedur'}! A passionate <span className="text-white font-bold underline decoration-brand-neon/50 decoration-2 underline-offset-4">{profile?.title || 'Full Stack Web Developer'}</span> from {profile?.location?.split(',')[1] || 'Bangladesh'} specializing in scalable digital solutions.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#portfolio" className="cta-button cta-green px-8 py-3.5">
                View My Work
              </a>
              <button 
                onClick={onHireClick}
                className="cta-button cta-outline px-8 py-3.5"
              >
                Hire Me
              </button>
            </div>

            <div className="mt-12 flex items-center gap-6">
              {[Github, Linkedin, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="text-white/40 hover:text-brand-neon transition-colors">
                  <Icon size={24} />
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            <div className="absolute inset-0 bg-brand-neon rounded-full blur-[60px] opacity-20"></div>
            <div className="relative z-10 w-full h-full rounded-full border-4 border-brand-neon/30 p-2 overflow-hidden">
              <div className="w-full h-full rounded-full bg-brand-green overflow-hidden flex items-center justify-center">
                <img 
                  src={profile?.profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"} 
                  alt={profile?.name || "Jahedur Rahman Shuvo"}
                  className="w-full h-full object-cover transition-transform duration-700 mt-4"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
              <p className="text-white/80 text-[10px] font-mono uppercase tracking-[0.2em]">Based in {profile?.location || 'Dhaka, Bangladesh'}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const SkillsSection = ({ skills }: { skills: Skill[] }) => {
  const categories = ['Frontend', 'Backend', 'Tools'];
  
  return (
    <section id="about" className="py-24 bg-bg-light text-brand-charcoal overflow-hidden px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((cat, idx) => {
            const filteredSkills = skills.filter(s => s.category === cat);
            return (
              <motion.div 
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bento-card p-8 flex flex-col"
              >
                <h3 className="text-gray-900 font-bold text-sm uppercase mb-6 tracking-wider border-b border-gray-100 pb-3">{cat}</h3>
                <div className={cn(
                  "flex-1 rounded-2xl border p-4 mb-4",
                  cat === 'Frontend' ? "bg-emerald-50 border-emerald-100" :
                  cat === 'Backend' ? "bg-blue-50 border-blue-100" : "bg-gray-50 border-gray-200"
                )}>
                   <span className={cn(
                     "text-[10px] font-bold uppercase block mb-3",
                     cat === 'Frontend' ? "text-emerald-800" :
                     cat === 'Backend' ? "text-blue-800" : "text-gray-800"
                   )}>Technologies</span>
                   <div className="flex flex-wrap gap-2">
                     {filteredSkills.length > 0 ? filteredSkills.map((skill) => (
                       <div key={skill.id} className="flex items-center gap-2 px-3 py-1 bg-white text-[11px] font-medium rounded-lg border">
                         {skill.icon && <img src={skill.icon} className="w-4 h-4 object-contain" alt="" />}
                         {skill.name}
                       </div>
                     )) : (
                       <span className="text-xs text-gray-400 italic">No skills added yet</span>
                     )}
                   </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const ProjectsSection = ({ projects }: { projects: Project[] }) => {
  return (
    <section id="portfolio" className="py-24 bg-bg-light text-brand-charcoal px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-brand-charcoal">Featured Projects</h2>
            <p className="text-brand-charcoal/60 max-w-xl">
              Selection of projects that define my technical expertise and creative problem-solving approach.
            </p>
          </div>
          <button className="cta-button cta-outline border-brand-charcoal/10 text-brand-charcoal hover:bg-brand-charcoal hover:text-white shrink-0 uppercase text-[11px] font-bold">
            View All Projects
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {projects.length > 0 ? projects.map((project, idx) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bento-card p-6 group flex flex-col"
            >
              <div className="h-44 bg-brand-green rounded-2xl mb-6 overflow-hidden relative">
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-32 bg-white/10 rounded-t-lg border border-white/20"></div>
                 </div>
                 <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-neon"></span>
                    <span className="w-2 h-2 rounded-full bg-white/20"></span>
                 </div>
                 {project.image && <img src={project.image} alt={project.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />}
              </div>
              
              <h4 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h4>
              <p className="text-xs text-gray-500 mb-6 line-clamp-2 leading-relaxed">{project.description}</p>
              
              <div className="mt-auto flex justify-between items-center">
                <div className="flex gap-2">
                  {project.tech?.map((t, ti) => (
                    <div key={ti} className="px-2 py-1 rounded bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase">
                      {t.substring(0, 3)}
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 items-center">
                  <button className="text-[11px] font-bold text-brand-green underline uppercase tracking-wider">Details</button>
                  <button className="px-5 py-2 bg-brand-neon text-black text-[11px] font-bold rounded-lg hover:shadow-lg transition-shadow">Live Demo</button>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="md:col-span-2 text-center py-20 bg-gray-50 rounded-3xl border border-gray-100 italic text-gray-400">
               No projects added yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 bg-brand-charcoal text-white px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-12">
          {[
            { title: 'Full Stack Development', desc: 'Building scalable web applications from scratch with modern stacks like MERN or JAMstack.', icon: <Layers size={32} /> },
            { title: 'System Architecture', desc: 'Designing robust database schemas and system workflows for high-traffic environments.', icon: <Cpu size={32} /> },
            { title: 'UI/UX Excellence', desc: 'Creating pixel-perfect, responsive designs that provide an intuitive user experience.', icon: <Layout size={32} /> }
          ].map((service, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:bg-brand-neon group-hover:text-brand-charcoal transition-all duration-500 group-hover:-translate-y-2">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
              <p className="text-white/40 leading-relaxed">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = ({ onAdminLogin }: { onAdminLogin: () => void }) => {
  const [clickCount, setClickCount] = useState(0);

  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      onAdminLogin();
      setClickCount(0);
    }
  };

  return (
    <footer id="contact" className="bg-brand-charcoal pt-24 pb-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-20">
          <div className="md:col-span-1">
            <div className="flex items-center gap-4 mb-8">
              <img 
                src="https://i.postimg.cc/Fzc0pSMd/20260505-223351.png" 
                alt="Jahedur Rahman Logo" 
                className="h-12 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="text-white font-bold text-2xl tracking-tight">Jahedur Rahman <span className="text-brand-neon">Shuvo</span></div>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white">Let's work <br />together.</h2>
            <p className="text-white/40 text-lg max-w-sm mb-10">
              I'm always open to new opportunities and interesting projects. Reach out if you'd like to collaborate.
            </p>
            <a href="mailto:shuvojahedurrahman15@gmail.com" className="text-2xl font-display font-medium text-brand-neon hover:underline decoration-2 underline-offset-8">
              shuvojahedurrahman15@gmail.com
            </a>
          </div>
          
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-8">Navigation</h3>
            <div className="flex flex-col gap-4">
              {['Home', 'About', 'Portfolio', 'Services', 'Contact'].map(link => (
                <a key={link} href={`#${link.toLowerCase()}`} className="text-white/70 hover:text-brand-neon transition-colors">
                  {link}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-8">Social</h3>
            <div className="flex flex-col gap-4">
              {['Github', 'LinkedIn', 'Twitter', 'Instagram'].map(link => (
                <a key={link} href="#" className="text-white/70 hover:text-brand-neon transition-colors">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-white/40 text-xs text-center md:text-left">
          <p 
            onClick={handleSecretClick}
            className="cursor-default select-none"
          >
            © {new Date().getFullYear()} Jahedur Rahman Shuvo. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);

  // Data State with mock data
  const [profile, setProfile] = useState<Profile | null>({
    name: "Jahedur Rahman Shuvo",
    title: "Full Stack Web Developer",
    bio: "Passionate about crafting dynamic web experiences and scalable digital solutions.",
    location: "Dhaka, Bangladesh",
    profileImage: "https://i.postimg.cc/Fzc0pSMd/20260505-223351.png"
  });
  const [projects, setProjects] = useState<Project[]>([
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
  const [skills, setSkills] = useState<Skill[]>([
    { id: '1', name: 'React', category: 'Frontend', icon: '' },
    { id: '2', name: 'Node.js', category: 'Backend', icon: '' },
    { id: '3', name: 'Tailwind CSS', category: 'Frontend', icon: '' },
    { id: '4', name: 'TypeScript', category: 'Tools', icon: '' }
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret key combination: Alt + L to login
      if (e.altKey && e.key.toLowerCase() === 'l') {
        handleAdminLogin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      const isUserAdmin = u?.email === 'shuvojahedurrahman15@gmail.com';
      setIsAdmin(isUserAdmin);
      if (!isUserAdmin) setIsAdminView(false);
      setLoading(false);
    });

    // Fetch Data from Firestore
    const profilePath = 'profile/main';
    const unsubProfile = onSnapshot(doc(db, 'profile', 'main'), (snap) => {
      if (snap.exists()) setProfile(snap.data() as Profile);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, profilePath);
    });

    const projectsPath = 'projects';
    const unsubProjects = onSnapshot(query(collection(db, projectsPath), orderBy('order', 'asc')), (snap) => {
      setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, projectsPath);
    });

    const skillsPath = 'skills';
    const unsubSkills = onSnapshot(query(collection(db, skillsPath), orderBy('order', 'asc')), (snap) => {
      setSkills(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Skill)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, skillsPath);
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unsubscribe();
      unsubProfile();
      unsubProjects();
      unsubSkills();
    };
  }, []);

  const handleAdminLogin = async () => {
    try {
      await loginWithGoogle();
      if (auth.currentUser?.email === 'shuvojahedurrahman15@gmail.com') {
        setIsAdminView(true);
      } else {
        alert('Access Denied. You are not the admin.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-charcoal flex items-center justify-center">
        <Loader2 className="text-brand-neon animate-spin" size={48} />
      </div>
    );
  }

  if (isAdminView && isAdmin) {
    return (
      <div id="admin">
        <div className="fixed top-6 left-6 z-[60]">
          <button 
            onClick={() => setIsAdminView(false)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-charcoal border border-white/10 rounded-full text-white text-xs font-bold hover:bg-white/5 transition-all"
          >
            <ArrowRight size={14} className="rotate-180" />
            Back to Site
          </button>
        </div>
        <AdminDashboard user={user} />
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar 
        user={user}
        isAdmin={isAdmin} 
        onDashboardClick={() => setIsAdminView(true)} 
        onHireClick={() => setIsHireModalOpen(true)}
      />
      <HeroSection profile={profile} onHireClick={() => setIsHireModalOpen(true)} />
      <SkillsSection skills={skills} />
      <ProjectsSection projects={projects} />
      <ServicesSection />
      <Footer onAdminLogin={handleAdminLogin} />
      <HireModal isOpen={isHireModalOpen} onClose={() => setIsHireModalOpen(false)} />
    </main>
  );
}
