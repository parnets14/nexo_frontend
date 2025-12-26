import React, { useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { FiPrinter, FiX, FiShield, FiCheckCircle, FiScissors } from 'react-icons/fi'

const TeamMemberIDCard = ({ member, partner, onClose }) => {
  const cardRef = useRef(null)
  const [showCutCard, setShowCutCard] = useState(false)

  const handlePrint = async () => {
    // Get QR code as data URL
    const qrElement = cardRef.current?.querySelector('svg')
    let qrDataUrl = ''
    
    if (qrElement) {
      const svgData = new XMLSerializer().serializeToString(qrElement)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      const img = new Image()
      await new Promise((resolve) => {
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          qrDataUrl = canvas.toDataURL('image/png')
          URL.revokeObjectURL(url)
          resolve()
        }
        img.onerror = () => resolve()
        img.src = url
      })
    }

    // Get the card element with all computed styles
    const cardElement = cardRef.current
    if (!cardElement) return
    
    // Create a deep clone
    const cardClone = cardElement.cloneNode(true)
    
    // Add cut card class if needed
    if (showCutCard) {
      cardClone.classList.add('id-card-cut')
    }
    
    // Copy all computed styles to inline styles for print
    const copyStyles = (source, target) => {
      const computed = window.getComputedStyle(source)
      Array.from(computed).forEach(key => {
        target.style.setProperty(key, computed.getPropertyValue(key), computed.getPropertyPriority(key))
      })
    }
    
    // Copy styles to all elements
    const allElements = cardClone.querySelectorAll('*')
    const sourceElements = cardElement.querySelectorAll('*')
    allElements.forEach((el, idx) => {
      if (sourceElements[idx]) {
        copyStyles(sourceElements[idx], el)
      }
    })
    copyStyles(cardElement, cardClone)
    
    // Replace QR code SVG with image if we have it
    if (qrDataUrl) {
      const qrClone = cardClone.querySelector('svg')
      if (qrClone && qrClone.parentNode) {
        const img = document.createElement('img')
        img.src = qrDataUrl
        img.style.width = '65px'
        img.style.height = '65px'
        img.style.display = 'block'
        qrClone.parentNode.replaceChild(img, qrClone)
      }
    }

    const printWindow = window.open('', '_blank')
    const cardContent = cardClone.outerHTML
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Team Member ID Card - Nexo</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: flex-start;
                min-height: 100vh;
                padding-top: 30px;
              }
              .id-card {
                transform: scale(1.8);
                transform-origin: top center;
                margin: 0 auto;
              }
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: #f5f5f5;
            }
            .id-card {
              width: 85.6mm;
              height: 53.98mm;
              background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
              border-radius: 12px;
              padding: 10px;
              box-shadow: 0 10px 40px rgba(79, 70, 229, 0.4);
              position: relative;
              overflow: hidden;
            }
            .id-card-cut {
              height: 70mm;
              overflow: visible;
            }
            .id-card-cut::after {
              content: '';
              position: absolute;
              bottom: 16mm;
              left: 5mm;
              right: 5mm;
              height: 1px;
              border-top: 1px dashed rgba(255,255,255,0.6);
            }
            .id-card::before {
              content: '';
              position: absolute;
              top: -50%;
              right: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
            }
            .id-card::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: linear-gradient(90deg, #4F46E5 0%, #7C3AED 50%, #4F46E5 100%);
            }
            .id-card-content {
              position: relative;
              z-index: 1;
              display: flex;
              height: 100%;
              background: white;
              border-radius: 8px;
              padding: 8px;
              box-shadow: inset 0 0 20px rgba(79, 70, 229, 0.1);
            }
            .id-card-cut .id-card-content {
              height: calc(100% - 16mm);
              margin-bottom: 16mm;
            }
            .id-card-tear-section {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 16mm;
              background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
              border-radius: 0 0 12px 12px;
              padding: 4px 8px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              gap: 2px;
              z-index: 5;
              font-size: 6px;
              color: rgba(255,255,255,0.9);
              text-align: center;
            }
            .id-card-left {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding-right: 8px;
            }
            .id-card-header {
              display: flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 6px;
              padding-bottom: 6px;
              border-bottom: 2px solid #4F46E5;
            }
            .id-card-logo {
              width: 28px;
              height: 28px;
              background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 800;
              font-size: 11px;
              letter-spacing: 0.5px;
            }
            .id-card-title {
              font-size: 9px;
              font-weight: 800;
              color: #4F46E5;
              text-transform: uppercase;
              letter-spacing: 1.2px;
            }
            .id-card-photo {
              width: 65px;
              height: 65px;
              border-radius: 8px;
              border: 3px solid #4F46E5;
              object-fit: cover;
              margin: 6px 0;
              box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
            }
            .id-card-name {
              font-size: 15px;
              font-weight: 800;
              color: #1a202c;
              margin-bottom: 4px;
              letter-spacing: 0.3px;
            }
            .id-card-details {
              font-size: 8.5px;
              color: #4a5568;
              line-height: 1.5;
            }
            .id-card-detail-item {
              margin-bottom: 3px;
              display: flex;
              align-items: center;
              gap: 4px;
            }
            .id-card-detail-item strong {
              color: #4F46E5;
              font-weight: 700;
              min-width: 45px;
            }
            .id-card-right {
              width: 85px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 6px;
              border-left: 2px dashed #e2e8f0;
              padding-left: 8px;
            }
            .id-card-qr {
              width: 75px;
              height: 75px;
              padding: 5px;
              background: white;
              border-radius: 6px;
              border: 2px solid #4F46E5;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 8px rgba(79, 70, 229, 0.15);
            }
            .id-card-verified {
              font-size: 7px;
              color: #48bb78;
              text-align: center;
              font-weight: 700;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 3px;
              background: #f0fdf4;
              padding: 3px 6px;
              border-radius: 4px;
              border: 1px solid #86efac;
            }
            .id-card-id {
              font-size: 7.5px;
              color: #4F46E5;
              text-align: center;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            .id-card-footer {
              font-size: 6.5px;
              color: #718096;
              text-align: center;
              margin-top: 2px;
            }
          </style>
        </head>
        <body>
          ${cardContent}
        </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const memberId = (member._id || member.id || '').toString().slice(-8).toUpperCase()
  const verificationUrl = `${window.location.origin}/verify/team-member/${member._id || member.id}`
  const memberName = member.name || 'Team Member'
  const memberPhone = member.phone || 'N/A'
  const memberCity = member.city || 'N/A'
  const memberRole = (member.role || 'technician').toUpperCase()
  const profilePicture = member.profilePicture 
    ? (member.profilePicture.startsWith('http') 
        ? member.profilePicture 
        : `http://localhost:9088/${member.profilePicture}`)
    : null
  const isVerified = member.kyc?.status === 'approved' || member.status === 'active'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-1">Team Member ID Card</h2>
            <p className="text-sm text-slate-600">Professional identification card with QR verification</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCutCard(!showCutCard)}
              className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                showCutCard 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title={showCutCard ? "Switch to Regular Card" : "Switch to Cut Card"}
            >
              <FiScissors />
              {showCutCard ? 'Cut Card' : 'Regular Card'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* ID Card Preview */}
        <div className="flex justify-center mb-6 bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-xl">
          <div 
            ref={cardRef} 
            className="id-card"
            style={{
              width: showCutCard ? '85.6mm' : '85.6mm',
              height: showCutCard ? '70mm' : '53.98mm',
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              borderRadius: '12px',
              padding: '10px',
              boxShadow: '0 10px 40px rgba(79, 70, 229, 0.4)',
              position: 'relative',
              overflow: showCutCard ? 'visible' : 'hidden'
            }}
          >
            {/* Cut Card Perforated Line */}
            {showCutCard && (
              <div style={{
                position: 'absolute',
                bottom: '16mm',
                left: '5mm',
                right: '5mm',
                height: '1px',
                borderTop: '1px dashed #fff',
                opacity: 0.6,
                zIndex: 10
              }} />
            )}
            
            {/* Cut Card Tear-off Section */}
            {showCutCard && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '16mm',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                borderRadius: '0 0 12px 12px',
                padding: '4px 8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '2px',
                zIndex: 5
              }}>
                <div style={{
                  fontSize: '6px',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 600,
                  textAlign: 'center',
                  letterSpacing: '0.5px'
                }}>
                  TEAR HERE
                </div>
                <div style={{
                  fontSize: '5.5px',
                  color: 'rgba(255,255,255,0.7)',
                  textAlign: 'center',
                  marginTop: '2px'
                }}>
                  {memberId}
                </div>
                <div style={{
                  fontSize: '5px',
                  color: 'rgba(255,255,255,0.6)',
                  textAlign: 'center',
                  marginTop: '1px'
                }}>
                  Keep this section for records
                </div>
              </div>
            )}
            {/* Decorative background pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
              pointerEvents: 'none'
            }} />
            
            <div className="id-card-content" style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              height: '100%',
              background: 'white',
              borderRadius: '8px',
              padding: '8px',
              boxShadow: 'inset 0 0 20px rgba(79, 70, 229, 0.1)'
            }}>
              <div className="id-card-left" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                paddingRight: '8px'
              }}>
                <div>
                  <div className="id-card-header" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '6px',
                    paddingBottom: '6px',
                    borderBottom: '2px solid #4F46E5'
                  }}>
                    <div className="id-card-logo" style={{
                      width: '28px',
                      height: '28px',
                      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '11px',
                      letterSpacing: '0.5px'
                    }}>
                      NEXO
                    </div>
                    <div className="id-card-title" style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      color: '#4F46E5',
                      textTransform: 'uppercase',
                      letterSpacing: '1.2px'
                    }}>Team Member</div>
                  </div>
                  
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt={memberName}
                      className="id-card-photo"
                      style={{
                        width: '65px',
                        height: '65px',
                        borderRadius: '8px',
                        border: '3px solid #4F46E5',
                        objectFit: 'cover',
                        margin: '6px 0',
                        boxShadow: '0 2px 8px rgba(79, 70, 229, 0.2)'
                      }}
                    />
                  ) : (
                    <div className="id-card-photo" style={{
                      width: '65px',
                      height: '65px',
                      borderRadius: '8px',
                      border: '3px solid #4F46E5',
                      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '24px',
                      margin: '6px 0',
                      boxShadow: '0 2px 8px rgba(79, 70, 229, 0.2)'
                    }}>
                      {memberName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div className="id-card-name" style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#1a202c',
                    marginBottom: '4px',
                    letterSpacing: '0.3px'
                  }}>{memberName}</div>
                  
                  <div className="id-card-details" style={{
                    fontSize: '8.5px',
                    color: '#4a5568',
                    lineHeight: 1.5
                  }}>
                    <div className="id-card-detail-item" style={{ marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <strong style={{ color: '#4F46E5', fontWeight: 700, minWidth: '45px' }}>ID:</strong>
                      <span>{memberId}</span>
                    </div>
                    <div className="id-card-detail-item" style={{ marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <strong style={{ color: '#4F46E5', fontWeight: 700, minWidth: '45px' }}>Role:</strong>
                      <span>{memberRole}</span>
                    </div>
                    <div className="id-card-detail-item" style={{ marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <strong style={{ color: '#4F46E5', fontWeight: 700, minWidth: '45px' }}>Phone:</strong>
                      <span>{memberPhone}</span>
                    </div>
                    {memberCity && memberCity !== 'N/A' && (
                      <div className="id-card-detail-item" style={{ marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <strong style={{ color: '#4F46E5', fontWeight: 700, minWidth: '45px' }}>City:</strong>
                        <span>{memberCity}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="id-card-right" style={{
                width: '85px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                borderLeft: '2px dashed #e2e8f0',
                paddingLeft: '8px'
              }}>
                <div className="id-card-qr" style={{
                  width: '75px',
                  height: '75px',
                  padding: '5px',
                  background: 'white',
                  borderRadius: '6px',
                  border: '2px solid #4F46E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.15)'
                }}>
                  <QRCodeSVG
                    value={verificationUrl}
                    size={65}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                {isVerified && (
                  <div className="id-card-verified" style={{
                    fontSize: '7px',
                    color: '#48bb78',
                    textAlign: 'center',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    background: '#f0fdf4',
                    padding: '3px 6px',
                    borderRadius: '4px',
                    border: '1px solid #86efac'
                  }}>
                    <FiCheckCircle style={{ fontSize: '8px' }} />
                    Verified
                  </div>
                )}
                <div className="id-card-id" style={{
                  fontSize: '7.5px',
                  color: '#4F46E5',
                  textAlign: 'center',
                  fontWeight: 700,
                  letterSpacing: '0.5px'
                }}>
                  Scan to Verify
                </div>
                <div className="id-card-footer" style={{
                  fontSize: '6.5px',
                  color: '#718096',
                  textAlign: 'center',
                  marginTop: '2px'
                }}>
                  nexo.works
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Print Actions */}
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition flex items-center gap-2 shadow-lg"
          >
            <FiPrinter /> Print ID Card
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition flex items-center gap-2"
          >
            <FiX /> Close
          </button>
        </div>

        <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="flex items-start gap-3">
            <FiShield className="text-indigo-600 text-xl flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-indigo-600 mb-1">Verification Features</p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• QR code links to public verification page</li>
                <li>• Anyone can scan to verify team member status</li>
                <li>• Shows verification status and credentials</li>
                <li>• Professional ID card format for printing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamMemberIDCard
