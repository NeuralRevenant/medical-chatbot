"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import styles from "./profile.module.scss";
import { fetcher } from "@/lib/fetcher";

// define a Zod schema for the form fields:
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
    const { data: session, status } = useSession();
    const [editMode, setEditMode] = useState(false);

    // SWR to fetch the user’s current profile
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

    // Whenever userData arrives, reset the form with the fetched info
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

    // submit handler to update the user’s profile
    const onSubmit = async (formValues: ProfileFormData) => {
        try {
            // Only send password if the user is actually changing it
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

            // Successful update
            setEditMode(false);
            // revalidate SWR cache so user sees updated data
            mutate();
        } catch (err: any) {
            alert(err.message);
        }
    };

    // Cancel editing: revert form changes to what’s in SWR
    const handleCancel = () => {
        if (userData) {
            reset({
                name: userData.name,
                email: userData.email,
                password: "",
                confirmPassword: "",
            });
        }
        setEditMode(false);
    };

    // Handle loading and error states
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
        <div className={styles.profilePage}>
            <div className={styles.profileCard}>
                <h2 className={styles.profileTitle}>Profile Information</h2>

                {editMode ? (
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

                        {/* Confirm Password (only if user sets a new password) */}
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
                            <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className={styles.readOnlyProfile}>
                        <p>
                            <strong>Name:</strong> {userData?.name}
                        </p>
                        <p>
                            <strong>Email:</strong> {userData?.email}
                        </p>
                        <button className={styles.editBtn} onClick={() => setEditMode(true)}>
                            Edit Profile
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
