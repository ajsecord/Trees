#ifndef TREES_VERSION_H
#define TREES_VERSION_H

#include "trees_environment.h"

/** The version of Trees being compiled against. */
#define TREES_VERSION 1.0.0

/**
 Returns the version of Trees that this library was compiled against.
  
 The version is returned as a string in the form of "MAJOR.MINOR.PATCH", where each of MAJOR,
 MINOR, and PATCH are decimal numbers corresponding to the appropriate semantic versioning
 component.

 The returned string should not be modified or freed.
*/
TREES_EXTERN const char* trees_get_version(void);

#endif
