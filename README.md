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


## V2.3.1 dimension input parser fix
Accepted examples: `12' 6"`, `12'`, `6"`, `3' 0"`, `10' 3.5"`, `3' 6 1/2"`, `6 1/2"`, and typographic foot/inch marks.
The parser converts the accepted input to millimetres internally and rejects invalid inch values of 12 or more.


## V2.3.2 parser rebuilt and tested
- Rebuilt the feet/inches parser without dynamically constructed regular expressions.
- Supports feet, inches, decimals, and fractional inches (e.g. `12' 6"`, `6"`, `3' 6 1/2"`).
- Bare numeric values are interpreted as feet.
- Rejects invalid inch values of 12 or more.
- Automated parser test cases passed.


## V2.3.3 object selection improvement
- Door selection hit-area includes the door leaf, opening line and swing arc.
- Window selection hit-area covers the complete window symbol.
- Objects are tested before their host wall, so tapping a door/window on a wall selects the object first.
- Selected objects receive an orange dashed selection outline.
- Selection hit areas include a touch-friendly minimum tolerance that adapts to zoom.


## V2.3.4 selection color
- Selected object symbols change to cyan (#22D3EE).
- Selected symbol line weight is increased for clearer visual feedback.
- The selection outline also uses cyan.


## V2.3.5 door placement and swing workflow
- Door tool tap on a wall opens Door Specification before creating a door.
- Confirm enters a cyan door preview. Drag along the same wall to set its position.
- Release to finalize the door placement.
- After selecting an installed door, drag to either side to change inward/outward swing. Its position on the wall stays fixed.
- Window placement/edit remains unchanged.
