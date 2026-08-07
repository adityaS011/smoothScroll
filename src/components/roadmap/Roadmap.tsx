import { roadmapConfig } from "./roadmapConfig";
import { RoadmapSection } from "./RoadmapSection";

export function Roadmap() {
  return (
    <div>
      {roadmapConfig.map((section, index) => (
        <RoadmapSection key={section.id} section={section} priority={index === 0} />
      ))}
    </div>
  );
}
