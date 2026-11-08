# My Site Measurement v2

Upload all six files directly into the root of your GitHub repository.

## Confirmed design choices
- Project fields: Project Name, Client Name, Project Address (no measurement date or floor plan field)
- Multiple floors per project
- Single-line walls, light grid, dimension entry in ft'inch
- 90-degree snap toggle
- Door, window, straight staircase and text tools
- Local browser storage; no cloud sync
- PNG export button

## Current build status
This is an early prototype of the new interface and drawing workflow. It is not yet the complete specification. Room/shared-wall detection, accurate object properties and snapping, reliable undo/redo, PDF export, and thorough offline/data backup handling still need implementation and testing. Keep a backup of project data and test with sample measurements before using it for actual site records.

Deploy with GitHub Pages: Settings → Pages → Deploy from a branch → main → /(root).


## Zoom & Pan update
- Use the **Pan** tool, then drag the canvas to move the view.
- Use **＋ / −** to zoom in and out.
- Use **Reset view** to return to the default view.
- On desktop, use the mouse wheel to zoom around the pointer.
- On touch screens, use two fingers to pinch zoom and move the view.


## Touch navigation and edit controls
- Use **two fingers together** to move (pan) the drawing area.
- Pinch two fingers apart/together to zoom in/out.
- One finger is used for drawing or selecting.
- Tap **Select**, then tap a wall or object to select it; tap **Delete** to remove it.
- **Undo** reverses the most recent wall/object addition or deletion (up to 50 actions).
- Tap **Reset view** to return to the default canvas view.


## V2.3 scale, grid and object properties
- Grid is drawn across the full visible workspace and follows pan/zoom.
- Internal geometry uses millimetres; input/display remains ft'inch; area remains sqft.
- Door/window can be selected and edited for width and position along its host wall.
- Door supports hinge side and inward/outward swing; window supports 1–6 panels.
