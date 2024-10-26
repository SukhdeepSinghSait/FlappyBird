import { useWindowDimensions } from "react-native";
import { Canvas, useImage, Image } from "@shopify/react-native-skia";


const Index = () => {
    const { width, height } = useWindowDimensions();

    const bg = useImage(require('../assets/sprites/background-day.png'));
    const bird = useImage(require('../assets/sprites/bluebird-midflap.png'));
    const pipeDown = useImage(require('../assets/sprites/pipe-green.png'));
    const pipeTop = useImage(require('../assets/sprites/pipe-green-top.png'));
    const base = useImage(require('../assets/sprites/base.png'));

    const pipeOffset = 0;

  return (
    <Canvas style={{ width, height }}>
        {/* Background */}
        <Image image={bg} width={width} height={height} fit={'cover'} />

        {/* Pipe */}
        <Image image={pipeTop} y={pipeOffset - 360} x={ width/2 } width={104} height={640} />
        <Image image={pipeDown} y={height - 280 + pipeOffset} x={ width/2 } width={104} height={640} />

        {/* Base */}
        <Image image={base} y={height - 75} width={width} height={150} x={0} fit={"cover"} />
        
        {/* Bird */}
        <Image image={bird} y={height / 2 - 24} x={ width / 4 } width={64} height={48} />
    </Canvas>
  );
};
export default Index;