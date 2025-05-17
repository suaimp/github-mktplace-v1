import { useState } from "react";
import UserAvatar from "../ui/avatar/UserAvatar";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role?: string;
  is_first_admin?: boolean;
}

interface UserMetaCardProps {
  profile: UserProfile | null;
}

export default function UserMetaCard({ profile }: UserMetaCardProps) {
  const [loading, setLoading] = useState(false);

  if (!profile) return null;

  const fullName = `${profile.first_name} ${profile.last_name}`;
  const role = profile.is_first_admin !== undefined 
    ? (profile.is_first_admin ? "Administrador Principal" : "Administrador")
    : (profile.role === "publisher" ? "Publisher" : "Anunciante");

  const handleAvatarChange = () => {
    // Refresh any components that need to show the updated avatar
    setLoading(prev => !prev);
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <UserAvatar
            userId={profile.id}
            name={fullName}
            size="lg"
            editable={true}
            onImageChange={handleAvatarChange}
          />
          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {fullName}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {profile.email}
              </p>
              <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}