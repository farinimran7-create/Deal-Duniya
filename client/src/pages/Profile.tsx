import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { LogOut, User as UserIcon, Settings, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) {
    window.location.href = "/api/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-10">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border"
        >
          <div className="bg-slate-900 h-32 relative">
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden">
                {user.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center text-4xl text-white font-bold">
                    {user.firstName?.[0]}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="pt-16 pb-8 px-6 text-center">
            <h1 className="text-2xl font-bold font-display">{user.firstName} {user.lastName}</h1>
            <p className="text-slate-500">{user.email}</p>
            
            <div className="mt-8 space-y-2">
              <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors font-medium">
                <Heart className="w-5 h-5 text-red-500" />
                Saved Coupons
              </button>
              <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors font-medium">
                <Settings className="w-5 h-5 text-slate-500" />
                Account Settings
              </button>
              
              <div className="h-4" />
              
              <button 
                onClick={() => logout()}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-bold"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
