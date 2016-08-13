#include "trees_version.h"

/** Convert the macro argument into a string. */
#define TREES_STRINGIFY_HELPER(x) #x

/**
 Expand and convert the macro argument into a string.

 This works by first expanding the argument and then passing it to TREES_STRINGIFY_HELPER().
 */
#define TREES_STRINGIFY(x) TREES_STRINGIFY_HELPER(x)

const char *trees_get_version(void) {
    return TREES_STRINGIFY(TREES_VERSION);
}
