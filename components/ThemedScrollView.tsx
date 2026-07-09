import React, {
    forwardRef,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Animated,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    ScrollViewProps,
    StyleSheet,
    View,
    useColorScheme,
} from "react-native";

import { Colors } from "@/constants/theme";


interface ThemedScrollViewProps extends ScrollViewProps {
  scrollbarWidth?: number;
}


const ThemedScrollView = forwardRef<
  ScrollView,
  ThemedScrollViewProps
>(
  (
    {
      children,
      scrollbarWidth = 5,
      onScroll,
      onContentSizeChange,
      ...props
    },
    ref
  ) => {

    const colorScheme = useColorScheme() ?? "light";
    const colors = Colors[colorScheme];


    const [containerHeight, setContainerHeight] =
      useState(0);

    const [contentHeight, setContentHeight] =
      useState(0);


    const thumbPosition =
      useRef(new Animated.Value(0)).current;


    const opacity =
      useRef(new Animated.Value(0)).current;


    const hideTimer =
      useRef<ReturnType<typeof setTimeout> | null>(
        null
      );



    const showScrollbar = () => {

      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }


      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();


      hideTimer.current = setTimeout(() => {

        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start();

      }, 1000);

    };



    useEffect(() => {

      return () => {

        if (hideTimer.current) {
          clearTimeout(hideTimer.current);
        }

      };

    }, []);



    const handleScroll = (
      event: NativeSyntheticEvent<NativeScrollEvent>
    ) => {

      const offsetY =
        event.nativeEvent.contentOffset.y;


      const trackHeight =
        containerHeight - 16;


      const thumbHeight =
        Math.max(
          (
            containerHeight /
            contentHeight
          ) *
          trackHeight,

          40
        );


      const maxScroll =
        contentHeight -
        containerHeight;


      const maxMove =
        trackHeight -
        thumbHeight;


      const position =
        maxScroll > 0
          ? (
              offsetY /
              maxScroll
            ) *
            maxMove
          : 0;


      Animated.timing(
        thumbPosition,
        {
          toValue: position,
          duration: 0,
          useNativeDriver: true,
        }
      ).start();


      showScrollbar();


      onScroll?.(event);

    };



    const handleContentSizeChange = (
      width: number,
      height: number
    ) => {

      console.log(
        "Scrollbar content height:",
        height
      );


      setContentHeight(height);


      onContentSizeChange?.(
        width,
        height
      );

    };



    const thumbHeight =
      containerHeight > 0 &&
      contentHeight > 0
        ? Math.max(
            (
              containerHeight /
              contentHeight
            ) *
            (containerHeight - 16),

            40
          )
        : 40;



    return (

      <View

        style={styles.wrapper}

        onLayout={(event) => {

          const height =
            event.nativeEvent.layout.height;


          console.log(
            "Scrollbar container height:",
            height
          );


          setContainerHeight(height);

        }}

      >

        <ScrollView

          ref={ref}

          {...props}

          showsVerticalScrollIndicator={false}

          onScroll={handleScroll}

          scrollEventThrottle={16}

          onContentSizeChange={
            handleContentSizeChange
          }

        >

          {children}

        </ScrollView>



        <View
          pointerEvents="none"

          style={[
            styles.track,

            {
              width:
                scrollbarWidth,

              backgroundColor:
                colors.border,
            },

          ]}

        >

          <Animated.View

            style={[

              styles.thumb,

              {

                width:
                  scrollbarWidth,


                height:
                  thumbHeight,


                backgroundColor:
                  colors.tint,


                opacity,


                transform:[
                  {
                    translateY:
                      thumbPosition,
                  },
                ],

              },

            ]}

          />

        </View>


      </View>

    );

  }
);



const styles = StyleSheet.create({

  wrapper: {
    flex: 1,
  },


  track: {

    position: "absolute",

    right: 5,

    top: 8,

    bottom: 8,

    borderRadius: 999,

    overflow: "hidden",

  },


  thumb: {

    position: "absolute",

    top: 0,

    left: 0,

    borderRadius: 999,

  },

});


export default ThemedScrollView;