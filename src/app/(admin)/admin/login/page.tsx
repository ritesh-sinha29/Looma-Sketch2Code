import { SignIn } from "@clerk/nextjs";

export default function AdminLoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Admin Login</h1>
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full shadow-none",
            },
          }}
          fallbackRedirectUrl="/admin"
        />
      </div>
    </div>
  );
}
