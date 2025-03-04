// src/services/youtubeService.js
import axios from 'axios';

// Cache to avoid repeated API calls for the same exercise
const videoCache = new Map();

// YouTube channel to use for videos
const YOUTUBE_CHANNEL = 'pinnaclefhclub';

// GitHub Pages host URL - hardcoded for production
const GITHUB_PAGES_URL = 'https://nickcresner.github.io';

// Function to get thumbnail URL for a video ID
export const getVideoThumbnail = (videoId) => {
  // Use default thumbnail which is more reliably available
  return `https://img.youtube.com/vi/${videoId}/default.jpg`;
};

// Sample coach notes for exercises
const coachNotes = {
  "Hip Bridge": "Focus on squeezing glutes at the top position. Keep core engaged throughout the movement.",
  "Bench Press": "Drive through your feet and keep shoulder blades retracted. Control the descent.",
  "DB Bench Press": "Keep wrists straight and elbows at a 45° angle to protect shoulders.",
  "Horizontal Rows": "Pull shoulder blades together at the top and fully extend at the bottom.",
  "Overhead Press": "Maintain a neutral spine and avoid excessive arching. Engage core throughout.",
  "Pull Down": "Keep chest proud and avoid excessive leaning back. Full range of motion is key.",
  "Bicep Curls": "Control the eccentric (lowering) portion. Keep elbows close to sides.",
  "Tricep Extensions": "Lock elbows in position and focus on isolating the triceps.",
  "Pallof Press": "Resist rotation - that's where the core work happens. Maintain good posture.",
  "Deadbug": "Press lower back into the floor throughout the movement. Exhale on exertion.",
  "Cat Cow": "Move slowly and coordinate movement with breath. Feel each vertebra articulate.",
  "Shoulder Mobility": "Stay within pain-free range of motion. Quality over quantity.",
  "Goblet Squat": "Keep chest up, knees in line with toes. Sit back as if to a chair.",
  "RDL": "Maintain slight knee bend. Feel the stretch in hamstrings, not lower back.",
  "Calf Raise": "Full range of motion - heels below platform at bottom, full extension at top.",
  "Bird Dog": "Keep hips level and move opposing limbs with control. Focus on stability."
};

// Get coach notes for an exercise
export const getCoachNotes = (exerciseName) => {
  // Search for exact or partial match in coach notes
  const exactMatch = coachNotes[exerciseName];
  if (exactMatch) return exactMatch;
  
  // Look for partial matches
  const exerciseNameLower = exerciseName.toLowerCase();
  for (const [name, notes] of Object.entries(coachNotes)) {
    if (exerciseNameLower.includes(name.toLowerCase()) || 
        name.toLowerCase().includes(exerciseNameLower)) {
      return notes;
    }
  }
  
  // Default note if no match found
  return "Focus on proper form and controlled movements. Contact a coach for specific guidance on this exercise.";
};

// This would normally use the YouTube Data API with your API key
// but for our exercise purposes, we'll use a simulation
export const findExerciseVideo = async (exerciseName) => {
  // Check cache first
  if (videoCache.has(exerciseName)) {
    return videoCache.get(exerciseName);
  }
  
  try {
    // Pinnacle FH Club channel videos with both videoId, embed code, and thumbnails
    const pinnacleVideos = [
      { 
        name: "Hip Bridge", 
        videoId: "fZZ5wYkIeXk",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/fZZ5wYkIeXk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "Bench Press", 
        videoId: "4lJ80wDcW8E",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/4lJ80wDcW8E" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "DB Bench Press", 
        videoId: "4lJ80wDcW8E",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/4lJ80wDcW8E" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "Horizontal Rows", 
        videoId: "F-Yx89MR4FM",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/F-Yx89MR4FM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "OH Press", 
        videoId: "oBGeXxnigsQ",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/oBGeXxnigsQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "Overhead Press", 
        videoId: "oBGeXxnigsQ",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/oBGeXxnigsQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "Pull Down", 
        videoId: "3qT5ZcYJskc",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/3qT5ZcYJskc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "Cable Pull Down", 
        videoId: "3qT5ZcYJskc",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/3qT5ZcYJskc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "Bicep Curls", 
        videoId: "kwG2ipFRgfo",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/kwG2ipFRgfo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "DB Bicep Curls", 
        videoId: "kwG2ipFRgfo",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/kwG2ipFRgfo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "Tricep Extensions", 
        videoId: "jQr-Zo4E1o4",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/jQr-Zo4E1o4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "Cable Tricep", 
        videoId: "jQr-Zo4E1o4",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/jQr-Zo4E1o4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "Pallof Press", 
        videoId: "AH_QZLGhQGE",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/AH_QZLGhQGE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "Deadbug", 
        videoId: "e-mqV4Dbqc4",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/e-mqV4Dbqc4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "Swiss Ball Deadbug", 
        videoId: "e-mqV4Dbqc4",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/e-mqV4Dbqc4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "Cat Cow", 
        videoId: "kqnua4rHVVA",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/kqnua4rHVVA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "Shoulder Mobility", 
        videoId: "l2VQ_WZ8Bto",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/l2VQ_WZ8Bto" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "Goblet Squat", 
        videoId: "mF5tnEBqOpU",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/mF5tnEBqOpU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "DB Goblet Squat", 
        videoId: "mF5tnEBqOpU",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/mF5tnEBqOpU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "RDL", 
        videoId: "ka9iZ3qkJ6s",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/ka9iZ3qkJ6s" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "Single Leg RDL", 
        videoId: "ka9iZ3qkJ6s",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/ka9iZ3qkJ6s" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "DB RDL", 
        videoId: "ka9iZ3qkJ6s",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/ka9iZ3qkJ6s" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "Calf Raise", 
        videoId: "c9SPIgq_vhc",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/c9SPIgq_vhc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      },
      { 
        name: "Bird Dog", 
        videoId: "7YVnpQPjPB8",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/7YVnpQPjPB8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      }
      // Add more videos as needed
    ];
    
    // Function to check if exercise name contains the video name
    const findMatchingVideo = () => {
      const exerciseNameLower = exerciseName.toLowerCase();
      
      // Try to find an exact match first
      const exactMatch = pinnacleVideos.find(video => 
        exerciseNameLower.includes(video.name.toLowerCase())
      );
      
      if (exactMatch) return exactMatch;
      
      // If no exact match, try to find any partial match
      return pinnacleVideos.find(video => {
        const keywords = video.name.toLowerCase().split(' ');
        return keywords.some(keyword => exerciseNameLower.includes(keyword));
      });
    };
    
    const matchingVideo = findMatchingVideo();
    
    if (matchingVideo) {
      // Return videoId, embedCode, thumbnail URL, and coach notes
      // Update the embed code to use youtube-nocookie.com for GitHub Pages
      const updatedEmbedCode = matchingVideo.embedCode.replace(
        'https://www.youtube.com/embed/',
        'https://www.youtube-nocookie.com/embed/'
      ).replace(
        'frameborder="0"',
        'frameborder="0" referrerpolicy="strict-origin-when-downgrade"'
      );
      
      const result = {
        videoId: matchingVideo.videoId,
        embedCode: updatedEmbedCode,
        thumbnailUrl: getVideoThumbnail(matchingVideo.videoId),
        coachNotes: getCoachNotes(exerciseName)
      };
      videoCache.set(exerciseName, result);
      return result;
    }
    
    // In a production environment, you could make an actual YouTube API call here
    // const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
    //   params: {
    //     part: 'snippet',
    //     maxResults: 1,
    //     q: `pinnacle fh club ${exerciseName}`,
    //     type: 'video',
    //     key: 'YOUR_API_KEY'
    //   }
    // });
    // 
    // if (response.data.items && response.data.items.length > 0) {
    //   const videoId = response.data.items[0].id.videoId;
    //   videoCache.set(exerciseName, videoId);
    //   return videoId;
    // }
    
    // If no match is found, return null
    videoCache.set(exerciseName, null);
    return null;
  } catch (error) {
    // Keep YouTube API error logging for debugging purposes
    console.error('Error fetching YouTube video:', error);
    return null;
  }
};