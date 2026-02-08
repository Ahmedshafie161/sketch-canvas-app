import { useCallback } from 'react';

export default function useCanvasHandlers({
  connectingFrom, setConnectingFrom,
  setConnections, connections,
  setCanvasObjects, canvasObjects,
  selectedObject, setSelectedObject
}) {
  const handleConnect = useCallback((objId) => {
    if (!connectingFrom) {
      setConnectingFrom(objId);
    } else if (connectingFrom !== objId) {
      setConnections([...connections, {
        id: Date.now(),
        from: connectingFrom,
        to: objId,
      }]);
      setConnectingFrom(null);
    }
  }, [connectingFrom, setConnectingFrom, setConnections, connections]);

  const deleteSelected = useCallback(() => {
    if (selectedObject) {
      setCanvasObjects(canvasObjects.filter(obj => obj.id !== selectedObject.id));
      setConnections(connections.filter(conn => 
        conn.from !== selectedObject.id && conn.to !== selectedObject.id
      ));
      setSelectedObject(null);
    }
  }, [selectedObject, setCanvasObjects, canvasObjects, setConnections, connections, setSelectedObject]);

  return { handleConnect, deleteSelected };
}
