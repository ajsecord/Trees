#ifndef TREES_ENVIRONMENT_H
#define TREES_ENVIRONMENT_H

/** Declares a function as extern in both C++ and C compilation. */
#ifdef __cplusplus
#   define TREES_EXTERN extern "C"
#else
#   define TREES_EXTERN extern
#endif

#endif
