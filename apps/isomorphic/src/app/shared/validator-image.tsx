"use client";

import { useState } from "react";
import Image from "next/image";
import cn from "@core/utils/class-names";
import { PiUserDuotone, PiWarningDuotone } from "react-icons/pi";

interface ValidatorImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackIcon?: React.ReactNode;
  showErrorState?: boolean;
}

export function ValidatorImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  sizes,
  priority = false,
  fallbackIcon,
  showErrorState = true,
}: ValidatorImageProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  // If image failed to load, show fallback UI
  if (imageError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 border border-gray-200 rounded-full",
          fill ? "w-full h-full" : "",
          className
        )}
        style={!fill ? { width, height } : {}}
      >
        {fallbackIcon || (
          <div className="flex flex-col items-center justify-center text-gray-400">
            {showErrorState ? (
              <>
                <PiWarningDuotone className="w-6 h-6 mb-1" />
                <span className="text-xs">Failed to load</span>
              </>
            ) : (
              <PiUserDuotone className="w-6 h-6" />
            )}
          </div>
        )}
      </div>
    );
  }

  // Render the actual image directly without loading state
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={cn("transition-opacity duration-300 object-contain", className)}
      onError={handleImageError}
      // Add unoptimized for local images to avoid Next.js optimization issues
      unoptimized={true}
    />
  );
}

// Specialized validator image component with common defaults
interface ValidatorAvatarProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  showErrorState?: boolean;
}

export function ValidatorAvatar({
  src,
  alt,
  size = 48,
  className = "",
  showErrorState = false,
}: ValidatorAvatarProps) {
  return (
    <ValidatorImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full object-contain", className)}
      showErrorState={showErrorState}
    />
  );
}

// Validator image with fill for containers
interface ValidatorImageFillProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  showErrorState?: boolean;
}

export function ValidatorImageFill({
  src,
  alt,
  className = "",
  sizes,
  priority = false,
  showErrorState = false,
}: ValidatorImageFillProps) {
  return (
    <ValidatorImage
      src={src}
      alt={alt}
      fill
      className={cn("object-contain", className)}
      sizes={sizes}
      priority={priority}
      showErrorState={showErrorState}
    />
  );
}

// Default export for backward compatibility
export default ValidatorImage;
