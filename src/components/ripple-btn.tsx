import * as React from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import type { TapGestureHandlerEventPayload } from 'react-native-gesture-handler';
import type { GestureEvent } from 'react-native-gesture-handler';
import {
    State,
    TapGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { hexToRgbA } from '../utils/hexToRgba';

type ValueOf<T> = T[keyof T];

type RippleBtnProps = {
    children: React.ReactElement;
    color: string;
    onPress?: () => void;
    rippleScale?: number,
    duration?: number,
    overflow?: boolean,
    rippleColor?: string,
    rippleOpacity?: number,
    containerStyle?: ViewStyle
}
type BtnRefs = {

}
const _RippleBtn = React.forwardRef<BtnRefs, RippleBtnProps>(({
    children,
    color,
    containerStyle,
    onPress = () => { },
    rippleScale = 1,
    duration = 250,
    overflow = false,
    rippleColor = '#000',
    rippleOpacity = 0.5,
}, ref) => {
    const [radius, setRadius] = React.useState(-1);
    const child = React.Children.only(children);
    const scale = useSharedValue(0);
    const positionX = useSharedValue(0);
    const positionY = useSharedValue(0);

    const isFinished = useSharedValue(false);
    const uas = useAnimatedStyle(() => ({
        top: positionY.value - radius,
        left: positionX.value - radius,
        transform: [{
            scale: scale.value,
        }],
    }), [radius]);
    const doubleTapHandler = useAnimatedGestureHandler<
        GestureEvent<TapGestureHandlerEventPayload>
    >({
        onStart: ({ numberOfPointers }) => {
            if (numberOfPointers !== 1) return;
            isFinished.value = false;
        },
        onActive: ({ x, y, numberOfPointers, state, }) => {
            if (numberOfPointers !== 1) return;
            if (state === State.FAILED) {
                scale.value = 0
            } else {
                positionX.value = x;
                positionY.value = y;
                scale.value = withTiming(
                    rippleScale,
                    { duration, easing: Easing.bezier(0, 0, 0.8, 0.4) },
                    (finised) => {
                        if (finised) {
                            isFinished.value = true;
                            scale.value = withTiming(0, { duration: 0 });
                        }

                    },
                )
            }





        },
        onEnd: () => {
            if (isFinished.value) {
                scale.value = withTiming(0, { duration: 0 });
            }
            if (onPress) {
                runOnJS(onPress)
            }
        }
    });
    return (
        <TapGestureHandler
            maxDurationMs={500}
            maxDeltaX={10}
            numberOfTaps={2}
            ref={ref}
            onGestureEvent={doubleTapHandler}
        >
            <Animated.View {...child.props} style={child.props.style}>
                <View
                    style={[{
                        ...StyleSheet.absoluteFillObject,
                        backgroundColor: color,
                        overflow: !overflow ? 'hidden' : undefined,
                    }, containerStyle]}
                    onLayout={({ nativeEvent: { layout: { width, height } } }) => {
                        setRadius(Math.sqrt(width ** 2 + height ** 2));
                    }}
                >
                    {radius !== -1 && (
                        <Animated.View style={[uas, {
                            position: 'absolute',
                            width: radius * 2,
                            height: radius * 2,
                            borderRadius: radius,
                            backgroundColor: hexToRgbA(rippleColor, rippleOpacity),
                        }]}
                        />
                    )}
                </View>
                {child.props.children}
            </Animated.View>
        </TapGestureHandler>
    );
}

)
export const RippleBtn = React.memo(_RippleBtn)