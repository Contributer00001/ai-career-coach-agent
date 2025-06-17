import { UserProfile } from '@clerk/nextjs'
import React from 'react'

function Profile() {
  return (
    <div>
      <UserProfile routing='hash'/>
    </div>
  )
}

export default Profile
