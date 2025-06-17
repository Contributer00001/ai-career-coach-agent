"use client"
import React from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

function WelcomeBanner() {
  const router = useRouter()
  return (
    <div className='p-5 bg-gradient-to-tr from-[#BE575F] via-[#A338E3] to-[#AC76D6] rounded-xl'>
      <h2 className='font-bold text-2xl text-white'>AI Career Coach Agent</h2>
      <p className='text-white'>Smarter career decisions start here - get tailored advice, real-time market insights and a roadmap built just for you with the power of Ai</p>
      <Button onClick={()=>router.push('/ai-tools')} variant={'outline'} className='mt-5 '>Let's Get Started</Button>
    </div>
  )
}

export default WelcomeBanner
