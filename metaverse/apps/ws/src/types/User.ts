interface SpaceElement {
  x: number;
  y: number;
  mapElement: {
    width: number;
    height: number;
    static: boolean;
  };
}

interface Space {
  id: string;
  width: number;
  height: number;
  elements: SpaceElement[];
}
