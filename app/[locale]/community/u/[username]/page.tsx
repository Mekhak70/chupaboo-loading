import Community from "@/components/community/Community"
export default async function UserPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  return <Community initialUsername={username} />
}
