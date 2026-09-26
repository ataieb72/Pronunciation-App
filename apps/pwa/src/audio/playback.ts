/** Plays a stored WAV take through an audio element. Rejects if the phone cannot play it. */
export async function playWav(wav: ArrayBuffer): Promise<void> {
  const url = URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }));
  const audio = new Audio(url);
  audio.onended = () => {
    URL.revokeObjectURL(url);
  };
  await audio.play();
}
