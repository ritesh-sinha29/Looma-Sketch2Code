import { auth, currentUser } from '@clerk/nextjs/server';
import { SignOutButton } from "@clerk/nextjs";
import Image from "next/image";
import React from 'react';
import UsersList from "./users-list";
import AdminSync from "./admin-sync";

const AdminPage = async () => {
  const { sessionClaims } = await auth();
  const user = await currentUser();

  return (
    <div className='min-h-screen bg-black text-white p-8 font-sans'>
        {/* Silent sync component */}
        <AdminSync />
        
        {/* Header Section */}
        <header className="flex items-center justify-between mb-12 pb-6 border-b border-gray-800">
            <div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                  Admin Console
                </h1>
                <p className="text-gray-400 mt-2">Manage your users and system settings</p>
            </div>
            
            <div className="flex items-center gap-4 bg-gray-900 p-2 pr-4 rounded-full border border-gray-800">
                <div className="text-sm">
                    <p className="font-semibold">{user?.fullName}</p>
                    <p className="text-xs text-gray-400 capitalize">{sessionClaims?.metadata.role}</p>
                </div>
                <div className="ml-4 pl-4 border-l border-gray-700">
                    <SignOutButton> 
                        <button className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer">
                            Sign Out
                        </button>
                    </SignOutButton>
                </div>
            </div>
        </header>

        <main className="max-w-6xl mx-auto space-y-8">
            {/* Stats / Info Block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 shadow-sm">
                    <h3 className="text-gray-400 text-sm mb-1">Session ID</h3>
                    <code className="text-xs text-purple-300 bg-purple-500/10 px-2 py-1 rounded">
                        {sessionClaims?.sid}
                    </code>
                 </div>
                 <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 shadow-sm">
                     <h3 className="text-gray-400 text-sm mb-1">Last Active</h3>
                     <p className="font-mono text-sm">{new Date().toLocaleTimeString()}</p>
                 </div>
                 <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 shadow-sm">
                     <h3 className="text-gray-400 text-sm mb-1">Admin Status</h3>
                     <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                         <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                         Active (Session Verified)
                     </div>
                 </div>
            </div>

            {/* Users Management */}
            <UsersList />
        </main>
    </div>
  )
}

export default AdminPage