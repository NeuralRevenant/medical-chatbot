"use client";

import React, { useState } from "react";
import styles from "./topBar.module.scss";
import { FaBars, FaUserCircle } from "react-icons/fa";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface TopBarProps {
  toggleSidebar: () => void;
}

export default function TopBar({ toggleSidebar }: TopBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setDropdownOpen(false);
    await signOut({ callbackUrl: "/login" });
  }

  function handleProfile() {
    setDropdownOpen(false);
    router.push("/profile");
  }

  return (
    <div className={styles.topBar}>
      <FaBars className={styles.burgerIcon} onClick={toggleSidebar} />

      <div className={styles.rightIcons}>
        <div className={styles.profileContainer}>
          <FaUserCircle
            className={styles.profileIcon}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          {dropdownOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownItem} onClick={handleProfile}>
                Profile
              </div>
              <div className={styles.dropdownItem} onClick={handleLogout}>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
