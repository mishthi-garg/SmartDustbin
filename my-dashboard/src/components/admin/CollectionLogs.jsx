import CollectionHistory from '../worker/CollectionHistory'

export default function CollectionLogs() {
  return (
    <>
      <h1 className="page-title">Collection logs</h1>
      <CollectionHistory refreshKey={0} />
    </>
  )
}