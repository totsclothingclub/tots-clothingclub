async function testOembed() {
  const postUrl = 'https://www.instagram.com/reel/Dcly3zlznly/'
  
  console.log('====================================================')
  console.log('TEST 1: Meta Graph oEmbed API (with placeholder token)')
  console.log('====================================================')
  const graphUrl = `https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent(postUrl)}&access_token=PLACEHOLDER_TOKEN`
  try {
    const res = await fetch(graphUrl)
    console.log('HTTP Status Code:', res.status, res.statusText)
    const json = await res.json()
    console.log('Response Body:\n', JSON.stringify(json, null, 2))
  } catch (err) {
    console.error('Fetch error:', err.message)
  }

  console.log('\n====================================================')
  console.log('TEST 2: Public Instagram oEmbed API (api.instagram.com)')
  console.log('====================================================')
  const publicUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(postUrl)}&omitscript=true`
  try {
    const res = await fetch(publicUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    console.log('HTTP Status Code:', res.status, res.statusText)
    const text = await res.text()
    try {
      console.log('Response Body:\n', JSON.stringify(JSON.parse(text), null, 2))
    } catch {
      console.log('Response Body (HTML/Text):\n', text.slice(0, 300))
    }
  } catch (err) {
    console.error('Fetch error:', err.message)
  }
}

testOembed()
