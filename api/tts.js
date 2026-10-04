export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body || {};

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text is required" });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;

    if (!apiKey) {
      return res.status(500).json({ error: "ELEVENLABS_API_KEY is missing" });
    }

    if (!voiceId) {
      return res.status(500).json({ error: "ELEVENLABS_VOICE_ID is missing" });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: "eleven_multilingual_v2"
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: errorText
      });
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.length);

    return res.status(200).send(audioBuffer);

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Voice generation failed"
    });
  }
                  }
