import React from 'react'
import AiTools from '../dashboard/_components/AiTools'
import WelcomeBanner from '../dashboard/_components/WelcomeBanner'

function AiToolsList() {
  return (
    <div>
        {/* <WelcomeBanner/> */}
        <h2 className='font-bold text-2xl mt-5'>AI Career Chat Agents</h2>
      <AiTools/>
    </div>
  )
}

export default AiToolsList
