import React from 'react'

export default function Footer() {
  return (
    <div className="bg-[#26435D] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left text-sm sm:text-base">
          Copyright.©2024.All right reserved
        </div>
        <div>
          <img src="/logo/logo_white.png" alt="HarborHub logo" width="100" height="32" />
        </div>
      </div>
    </div>
  )
}


