"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaBars } from "react-icons/fa";

import styles from "./profile.module.scss";
import { fetcher } from "@/lib/fetcher";

// Zod schema for the form fields
const ProfileSchema = z
    .object({
        name: z.string().min(3, "Name must be at least 3 characters"),
        email: z.string().email("Invalid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(30, "Password cannot exceed 30 characters")
            .optional()
            .or(z.literal("")), // allow empty
        confirmPassword: z.string().optional(),
    })
    .refine((data) => !data.password || data.password === data.confirmPassword, {
        message: "Passwords must match",
        path: ["confirmPassword"],
    });

type ProfileFormData = z.infer<typeof ProfileSchema>;

export default function ProfilePage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    // const [editMode, setEditMode] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Dropdown logic
    const toggleDropdown = () => {
        setDropdownOpen((open) => !open);
    };
    const handleBackToChat = () => {
        router.push("/");
        setDropdownOpen(false);
    };
    const handleLogout = async () => {
        setDropdownOpen(false);
        await signOut({ callbackUrl: "/login" });
    };


    // SWR to fetch current profile
    const {
        data: userData,
        error,
        isLoading,
        mutate,
    } = useSWR("/api/user/profile", fetcher);

    // react-hook-form setup
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(ProfileSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    // Whenever userData arrives, reset the form with that info
    useEffect(() => {
        if (userData) {
            reset({
                name: userData.name ?? "",
                email: userData.email ?? "",
                password: "",
                confirmPassword: "",
            });
        }
    }, [userData, reset]);

    // Submit handler to update user profile
    const onSubmit = async (formValues: ProfileFormData) => {
        try {
            if (!(formValues.name != userData.name || formValues.email != userData.email || formValues.password)) {
                alert("Modify the values to edit the profile!");
                return;
            }
            const body: Partial<ProfileFormData> = {
                name: formValues.name,
                email: formValues.email,
            };
            if (formValues.password) {
                body.password = formValues.password;
            }

            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errorResponse = await res.json();
                throw new Error(errorResponse.error || "Failed to update profile");
            }

            // setEditMode(false);
            mutate(); // revalidate SWR
        } catch (err: any) {
            alert(err.message);
        }
    };

    // Cancel editing: revert to original values
    const handleCancel = () => {
        if (userData) {
            reset({
                name: userData.name,
                email: userData.email,
                password: "",
                confirmPassword: "",
            });
        }
        // setEditMode(false);
    };

    // Loading / Auth checks
    if (status === "loading" || isLoading) {
        return <div>Loading profile...</div>;
    }
    if (status === "unauthenticated") {
        return <div>Please sign in to view your profile.</div>;
    }
    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <>
            {/* top bar - profile page */}
            <div className={styles.topBar}>
                <h2 className={styles.topBarTitle}>Profile</h2>

                <div className={styles.dropdownContainer}>
                    <FaBars className={styles.hamburgerIcon} onClick={toggleDropdown} />
                    {dropdownOpen && (
                        <div className={styles.dropdown}>
                            <div className={styles.dropdownItem} onClick={handleBackToChat}>
                                Chat
                            </div>
                            <div className={styles.dropdownItem} onClick={handleLogout}>
                                Logout
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.profilePage}>
                <div className={styles.profileCard}>
                    <h2 className={styles.profileTitle}>Profile Information</h2>

                    <form className={styles.profileForm} onSubmit={handleSubmit(onSubmit)}>
                        {/* Name */}
                        <div className={styles.profileInfo}>
                            <label htmlFor="name">Name</label>
                            <input id="name" type="text" {...register("name")} />
                            {errors.name && (
                                <p className={styles.error}>{errors.name.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className={styles.profileInfo}>
                            <label htmlFor="email">Email</label>
                            <input id="email" type="email" {...register("email")} />
                            {errors.email && (
                                <p className={styles.error}>{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password (optional) */}
                        <div className={styles.profileInfo}>
                            <label htmlFor="password">New Password</label>
                            <input id="password" type="password" {...register("password")} />
                            {errors.password && (
                                <p className={styles.error}>{errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className={styles.profileInfo}>
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                {...register("confirmPassword")}
                            />
                            {errors.confirmPassword && (
                                <p className={styles.error}>
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <div className={styles.actionButtons}>
                            <button type="submit" className={styles.saveBtn}>
                                Save
                            </button>
                            <button
                                type="button"
                                className={styles.cancelBtn}
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
