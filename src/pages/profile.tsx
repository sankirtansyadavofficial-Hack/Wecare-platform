import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/context/auth-context";
import { User, LogOut, Camera, ShieldCheck, Activity, MapPin, Droplet, FileText, Phone } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bloodGroup: user?.bloodGroup || "",
    medicalId: user?.medicalId || "",
    phone: "",
    address: "",
    allergies: "",
  });

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: formData.name,
      bloodGroup: formData.bloodGroup,
      // In a real app we would update the rest too
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-transparent w-full pb-24">
      <PageHeader 
        title="Medical Profile" 
        description="Manage your personal information, medical history, and account settings." 
        icon={User} 
      />

      <div className="max-w-4xl mx-auto px-6 mt-12">
        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-3xl p-8 shadow-sm">
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 border-b border-gray-200/50 dark:border-white/10 pb-8 mb-8">
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">{user.name}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit mx-auto md:mx-0 border ${user.role === 'doctor' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' : 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'}`}>
                  {user.role === 'doctor' ? 'Verified Doctor' : 'Patient Account'}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-4">{user.email}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <button onClick={() => setIsEditing(!isEditing)} className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl text-sm transition-colors hover:bg-gray-800 dark:hover:bg-gray-200">
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
                <button onClick={handleLogout} className="px-5 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold rounded-xl text-sm border border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-400" /> Personal Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                      <input type="text" disabled={!isEditing} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/50 outline-none transition-all disabled:opacity-75 disabled:bg-gray-50 dark:disabled:bg-zinc-900/30" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                      <input type="email" disabled value={formData.email} className="w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/50 outline-none transition-all disabled:opacity-75 disabled:bg-gray-50 dark:disabled:bg-zinc-900/30" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                        <input type="tel" disabled={!isEditing} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/50 outline-none transition-all disabled:opacity-75 disabled:bg-gray-50 dark:disabled:bg-zinc-900/30" placeholder="+1 (555) 000-0000" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-red-400" /> Medical Information
                  </h3>
                  <div className="space-y-4">
                    {user.role === 'doctor' ? (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Medical ID</label>
                        <input type="text" disabled value={formData.medicalId} className="w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/50 outline-none transition-all disabled:opacity-75 disabled:bg-gray-50 dark:disabled:bg-zinc-900/30" />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Blood Group</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Droplet className="h-4 w-4 text-red-500" />
                            </div>
                            <select disabled={!isEditing} value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} className="w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/50 outline-none transition-all disabled:opacity-75 disabled:bg-gray-50 dark:disabled:bg-zinc-900/30">
                              <option value="">Select Blood Group</option>
                              <option value="A+">A+</option>
                              <option value="A-">A-</option>
                              <option value="B+">B+</option>
                              <option value="B-">B-</option>
                              <option value="AB+">AB+</option>
                              <option value="AB-">AB-</option>
                              <option value="O+">O+</option>
                              <option value="O-">O-</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Known Allergies</label>
                          <textarea disabled={!isEditing} value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} className="w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/50 outline-none transition-all disabled:opacity-75 disabled:bg-gray-50 dark:disabled:bg-zinc-900/30 resize-none h-24" placeholder="List any known allergies..." />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="mt-8 flex justify-end border-t border-gray-200/50 dark:border-white/10 pt-6">
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-colors">
                  Save Changes
                </button>
              </div>
            )}
          </form>

        </div>
        
        <div className="mt-8 text-center flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          HIPAA & GDPR Compliant Security
        </div>
      </div>
    </div>
  );
}
